/**
 * Prescription Controller — Production hardened
 *
 * Fixes:
 * - doctorId now resolved via resolveDoctorId() — eliminates FK violations
 * - assertRequired() for input validation
 * - Raw errors never sent to client
 * - activityLogger receives role
 */

const crypto = require('crypto');
const prisma  = require('../config/prisma');
const { logActivity } = require('../services/activityLogger');
const fhirService = require('../services/fhirService');
const externalFhirService = require('../services/externalFhirService');
const logger  = require('../utils/logger');
const { AppError, ERROR_CODES } = require('../utils/errors');
const { resolveDoctorId } = require('../utils/resolvers');
const { assertRequired } = require('../utils/validators');

const genId = () => `RX-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const mapPrescription = (rx) => {
  if (!rx) return null;
  return {
    id:                 rx.id,
    prescriptionId:     rx.id,
    patientId:          rx.patientId,
    patientName:        rx.patientName,
    doctorId:           rx.doctorId,
    doctorName:         rx.doctorName,
    diagnosis:          rx.diagnosis,
    status:             rx.status,
    dispensedBy:        rx.dispensedBy,
    dispensedAt:        rx.dispensedAt,
    externalReferenceId: rx.externalReferenceId,
    assignedPharmacyId: rx.assignedPharmacyId,
    createdAt:          rx.createdAt,
    updatedAt:          rx.updatedAt,
    medications: (rx.medications || []).map(med => ({
      name:      med.name,
      dosage:    med.dosage,
      frequency: med.frequency,
      duration:  med.duration,
    })),
  };
};

class PrescriptionController {
  async createPrescription(req, res, next) {
    try {
      const { patientId, patientName, medications, diagnosis, assignedPharmacyId } = req.body;

      assertRequired(['patientId', 'patientName', 'medications'], req.body);

      if (!Array.isArray(medications) || medications.length === 0) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'At least one medication is required');
      }

      // Resolve doctor FK — works for both 'DR-dr.smith' and 'dr.smith'
      const rawDoctorId = req.user?.doctorId || req.user?.userId;
      const doctorRecord = await resolveDoctorId(rawDoctorId);

      const prescription = await prisma.prescription.create({
        data: {
          id:                 genId(),
          patientId,
          patientName,
          doctorId:           doctorRecord.id,
          doctorName:         req.user?.fullName || doctorRecord.name || '',
          diagnosis:          diagnosis || '',
          status:             'pending',
          assignedPharmacyId: assignedPharmacyId || null,
          medications: {
            create: medications.map(med => ({
              name:      String(med.name || ''),
              dosage:    String(med.dosage || ''),
              frequency: String(med.frequency || ''),
              duration:  String(med.duration || ''),
            })),
          },
        },
        include: { medications: true },
      });

      logActivity('PRESCRIPTION_CREATED', req.user?.userId, {
        prescriptionId: prescription.id,
        patientId,
        assignedPharmacyId,
      }, req.user?.role).catch(() => {});

      // FHIR sync — fire-and-forget
      fhirService.syncPrescription(prescription)
        .then(fhirRes => {
          if (fhirRes?.id) {
            prisma.prescription.update({ where: { id: prescription.id }, data: { fhirResourceId: fhirRes.id } })
              .catch(e => logger.error('[FHIR] Rx fhirResourceId save failed', { error: e.message }));
          }
        })
        .catch(err => logger.error('[FHIR] Prescription sync failed', { error: err.message }));

      // External pharmacy submission — fire-and-forget
      externalFhirService.submitPrescription(prescription)
        .then(extRes => {
          if (extRes?.id) {
            prisma.prescription.update({ where: { id: prescription.id }, data: { externalReferenceId: extRes.id } })
              .catch(e => logger.error('[External] Rx externalReferenceId save failed', { error: e.message }));
          }
        })
        .catch(err => logger.error('[External] Prescription submission failed', { error: err.message }));

      return res.status(201).json({ success: true, data: mapPrescription(prescription) });
    } catch (err) {
      next(err);
    }
  }

  async dispensePrescription(req, res, next) {
    try {
      const { prescriptionId } = req.params;
      const dispensedBy = req.user?.userId;

      const existing = await prisma.prescription.findUnique({ where: { id: prescriptionId } });

      if (!existing) {
        throw new AppError(ERROR_CODES.RECORD_NOT_FOUND, `Prescription ${prescriptionId} not found`);
      }
      if (existing.status !== 'pending') {
        throw new AppError(ERROR_CODES.ALREADY_DISPENSED, `Prescription ${prescriptionId} is not in pending state`);
      }

      const prescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data:  { status: 'dispensed', dispensedBy, dispensedAt: new Date() },
        include: { medications: true },
      });

      logActivity('PRESCRIPTION_DISPENSED', dispensedBy, { prescriptionId }, req.user?.role).catch(() => {});

      fhirService.syncPrescription(prescription)
        .catch(err => logger.error('[FHIR] Prescription dispense sync failed', { error: err.message }));

      return res.json({ success: true, data: mapPrescription(prescription) });
    } catch (err) {
      next(err);
    }
  }

  async listPrescriptions(req, res, next) {
    try {
      const { patientId, doctorId, status } = req.query;
      const where = {};

      if (req.user?.role === 'patient') {
        where.patientId = req.user.patientId || req.user.userId;
      } else if (req.user?.role === 'pharmacist') {
        where.OR = [
          { assignedPharmacyId: req.user.userId },
          { assignedPharmacyId: null },
        ];
      }

      if (patientId && req.user?.role !== 'patient') where.patientId = patientId;
      if (doctorId)  where.doctorId  = doctorId;
      if (status)    where.status    = status;

      const prescriptions = await prisma.prescription.findMany({
        where,
        include:  { medications: true },
        orderBy:  { createdAt: 'desc' },
      });

      return res.json({ success: true, data: prescriptions.map(mapPrescription) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PrescriptionController();
