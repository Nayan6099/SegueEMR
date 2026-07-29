const express = require('express');
const prisma = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');

const router = express.Router();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'super_secret_webhook_key_123';

/**
 * Middleware to authenticate webhook callers using a shared secret header.
 * Note: A production deployment would ideally use stronger authentication mechanisms
 * such as mutual TLS (mTLS), asymmetric digital signatures, or signed OAuth JWTs.
 */
function authenticateWebhook(req, res, next) {
  const callerSecret = req.headers['x-webhook-secret'];
  if (!callerSecret || callerSecret !== WEBHOOK_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized webhook call: Invalid secret.'
    });
  }
  next();
}

// Apply authentication middleware to all webhook routes in this router
router.use(authenticateWebhook);

/**
 * POST /api/webhooks/lab/result
 * FHIR DiagnosticReport Receiver
 */
router.post('/lab/result', async (req, res) => {
  try {
    const report = req.body;
    
    if (!report || report.resourceType !== 'DiagnosticReport') {
      return res.status(400).json({ success: false, error: 'Invalid FHIR resource type' });
    }

    // Match LabOrder using fhirResourceId or externalReferenceId
    // The conclusion will be mapped to resultSummary, and individual results can map to resultFields
    const externalId = report.id;
    if (!externalId) {
      return res.status(400).json({ success: false, error: 'DiagnosticReport id is required for matching' });
    }

    const labOrder = await prisma.labOrder.findFirst({
      where: {
        externalReferenceId: externalId
      }
    });

    if (!labOrder) {
      return res.status(404).json({ success: false, error: `No matching lab order found for external reference: ${externalId}` });
    }

    const resultSummary = report.conclusion || 'Lab results processed successfully.';
    
    // Parse result fields (custom SNOMED/LOINC codes or text values)
    const resultFieldsMap = {};
    if (Array.isArray(report.result) && report.result.length > 0) {
      report.result.forEach((resRef, index) => {
        resultFieldsMap[`test_${index + 1}`] = resRef.display || resRef.reference || 'Value reported';
      });
    } else {
      resultFieldsMap['summary'] = resultSummary;
    }

    // Update PostgreSQL LabOrder record
    const updatedLabOrder = await prisma.labOrder.update({
      where: { id: labOrder.id },
      data: {
        status: 'completed',
        resultSummary,
        resultFields: JSON.stringify(resultFieldsMap),
        processedBy: 'external_lab',
        updatedAt: new Date()
      }
    });

    await logActivity('EXTERNAL_LAB_RESULT_RECEIVED', 'external_lab', { labOrderId: labOrder.id });

    // Fetch UserIds for Doctor and Patient to generate notifications
    const patientObj = await prisma.patient.findUnique({ where: { id: labOrder.patientId } });
    const doctorObj = await prisma.doctor.findUnique({ where: { id: labOrder.doctorId } });

    if (patientObj && patientObj.userId) {
      await prisma.notification.create({
        data: {
          userId: patientObj.userId,
          title: 'Lab Result Ready',
          message: `Lab result ready for ${labOrder.testName}`,
          type: 'lab_result',
          referenceType: 'LabOrder',
          referenceId: labOrder.id
        }
      });
    }

    if (doctorObj && doctorObj.userId) {
      await prisma.notification.create({
        data: {
          userId: doctorObj.userId,
          title: 'Lab Result Ready',
          message: `Lab result ready for ${labOrder.patientName} (${labOrder.testName})`,
          type: 'lab_result',
          referenceType: 'LabOrder',
          referenceId: labOrder.id
        }
      });
    }

    return res.json({
      success: true,
      message: 'Diagnostic report processed, lab order updated and notifications triggered.',
      data: updatedLabOrder
    });
  } catch (err) {
    console.error('[Webhooks] Lab result error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/webhooks/pharmacy/dispense
 * FHIR MedicationDispense Receiver
 */
router.post('/pharmacy/dispense', async (req, res) => {
  try {
    const dispense = req.body;

    if (!dispense || dispense.resourceType !== 'MedicationDispense') {
      return res.status(400).json({ success: false, error: 'Invalid FHIR resource type' });
    }

    // Match Prescription using MedicationRequest references
    let externalId = null;
    if (Array.isArray(dispense.authorizingPrescription) && dispense.authorizingPrescription.length > 0) {
      const ref = dispense.authorizingPrescription[0].reference || '';
      externalId = ref.replace('MedicationRequest/', '');
    }

    if (!externalId) {
      return res.status(400).json({ success: false, error: 'authorizingPrescription reference is required for matching' });
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        externalReferenceId: externalId
      }
    });

    if (!prescription) {
      return res.status(404).json({ success: false, error: `No matching prescription found for external reference: ${externalId}` });
    }

    // Update PostgreSQL Prescription record
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: 'dispensed',
        dispensedBy: 'external_pharmacy',
        dispensedAt: new Date(),
        updatedAt: new Date()
      }
    });

    await logActivity('EXTERNAL_PHARMACY_DISPENSE_RECEIVED', 'external_pharmacy', { prescriptionId: prescription.id });

    // Fetch UserIds for Doctor and Patient to generate notifications
    const patientObj = await prisma.patient.findUnique({ where: { id: prescription.patientId } });
    const doctorObj = await prisma.doctor.findUnique({ where: { id: prescription.doctorId } });

    if (patientObj && patientObj.userId) {
      await prisma.notification.create({
        data: {
          userId: patientObj.userId,
          title: 'Prescription Dispensed',
          message: 'Your prescription has been dispensed',
          type: 'prescription_dispense',
          referenceType: 'Prescription',
          referenceId: prescription.id
        }
      });
    }

    if (doctorObj && doctorObj.userId) {
      await prisma.notification.create({
        data: {
          userId: doctorObj.userId,
          title: 'Prescription Dispensed',
          message: `Prescription dispensed for ${prescription.patientName}`,
          type: 'prescription_dispense',
          referenceType: 'Prescription',
          referenceId: prescription.id
        }
      });
    }

    return res.json({
      success: true,
      message: 'Medication dispense processed, prescription updated and notifications triggered.',
      data: updatedPrescription
    });
  } catch (err) {
    console.error('[Webhooks] Pharmacy dispense error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
