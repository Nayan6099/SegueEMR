const axios = require('axios');
require('dotenv').config();

const {
  FHIR_BASE_URL,
  FHIR_TOKEN_URL,
  FHIR_CLIENT_ID,
  FHIR_CLIENT_SECRET,
  FHIR_SCOPE
} = process.env;

let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Gets OAuth2 access token for the FHIR server using Client Credentials Flow
 */
async function getAccessToken() {
  const now = Date.now();
  if (accessToken && tokenExpiresAt > now + 300000) {
    return accessToken;
  }

  if (!FHIR_TOKEN_URL || !FHIR_CLIENT_ID || !FHIR_CLIENT_SECRET) {
    // If not fully configured, return null (allows graceful dev mock recovery)
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', FHIR_CLIENT_ID);
    params.append('client_secret', FHIR_CLIENT_SECRET);
    if (FHIR_SCOPE) {
      params.append('scope', FHIR_SCOPE);
    }

    const response = await axios.post(FHIR_TOKEN_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000
    });

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
    return accessToken;
  } catch (error) {
    console.error('[FHIR] Error fetching token:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Syncs a generic resource to the FHIR Server via REST OData Web API
 */
async function syncResource(resourceType, resourceData, fhirResourceId = null) {
  if (!FHIR_BASE_URL) {
    console.warn(`[FHIR] Sync skipped: FHIR_BASE_URL is not set.`);
    return null;
  }

  const token = await getAccessToken();
  const headers = {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = fhirResourceId ? 'PUT' : 'POST';
  const url = fhirResourceId
    ? `${FHIR_BASE_URL}/${resourceType}/${fhirResourceId}`
    : `${FHIR_BASE_URL}/${resourceType}`;

  try {
    const data = { ...resourceData };
    if (fhirResourceId) {
      data.id = fhirResourceId;
    }

    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: 5000
    });

    console.log(`[FHIR] Successfully synced ${resourceType} (${method})`);
    return response.data;
  } catch (error) {
    console.error(`[FHIR] Error syncing ${resourceType} to FHIR:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * EHR record ➔ DocumentReference
 */
async function syncEHRRecord(record, blobUrl) {
  const resourceData = {
    resourceType: 'DocumentReference',
    status: 'current',
    docStatus: 'final',
    type: {
      coding: [{
        system: 'http://loinc.org',
        code: '34133-9',
        display: 'Summary of clinical note'
      }],
      text: record.recordType || 'Medical Record'
    },
    subject: {
      reference: `Patient/${record.patientId}`
    },
    author: [{
      reference: `Practitioner/${record.doctorId || 'unknown'}`
    }],
    content: [{
      attachment: {
        url: blobUrl || '',
        contentType: 'application/octet-stream'
      }
    }],
    description: record.description || ''
  };

  return syncResource('DocumentReference', resourceData, record.fhirResourceId);
}

/**
 * Appointment ➔ Appointment
 */
async function syncAppointment(appointment) {
  const resourceData = {
    resourceType: 'Appointment',
    status: appointment.status === 'completed' 
      ? 'fulfilled' 
      : appointment.status === 'cancelled' 
        ? 'cancelled' 
        : 'booked',
    start: new Date(appointment.scheduledTime).toISOString(),
    participant: [
      {
        actor: { reference: `Patient/${appointment.patientId}` },
        status: 'accepted'
      },
      {
        actor: { reference: `Practitioner/${appointment.doctorId}` },
        status: 'accepted'
      }
    ],
    description: appointment.notes || ''
  };

  return syncResource('Appointment', resourceData, appointment.fhirResourceId);
}

/**
 * Prescription ➔ MedicationRequest (simplified: first medication or generic order request)
 */
async function syncPrescription(prescription) {
  // Map first medication to MedicationRequest, display others in notes/dosage
  const meds = prescription.medications || [];
  if (meds.length === 0) return null;

  const firstMed = meds[0];
  const medsDesc = meds.map(m => `${m.name} (Dosage: ${m.dosage || ''}, Frequency: ${m.frequency || ''}, Duration: ${m.duration || ''})`).join('; ');

  const resourceData = {
    resourceType: 'MedicationRequest',
    status: prescription.status === 'dispensed' ? 'completed' : 'active',
    intent: 'order',
    subject: {
      reference: `Patient/${prescription.patientId}`
    },
    requester: {
      reference: `Practitioner/${prescription.doctorId}`
    },
    medicationCodeableConcept: {
      text: firstMed.name
    },
    dosageInstruction: [{
      text: medsDesc
    }]
  };

  return syncResource('MedicationRequest', resourceData, prescription.fhirResourceId);
}

/**
 * LabOrder ➔ ServiceRequest (on order) or DiagnosticReport (once results uploaded)
 */
async function syncLabOrder(labOrder) {
  if (labOrder.status === 'completed') {
    // Sync DiagnosticReport
    const resourceData = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: {
        text: labOrder.testName
      },
      subject: {
        reference: `Patient/${labOrder.patientId}`
      },
      performer: [{
        reference: `Practitioner/${labOrder.processedBy || labOrder.doctorId}`
      }],
      conclusion: labOrder.resultSummary || '',
      note: [{
        text: labOrder.notes || ''
      }]
    };
    return syncResource('DiagnosticReport', resourceData, labOrder.fhirResourceId);
  } else {
    // Sync ServiceRequest
    const resourceData = {
      resourceType: 'ServiceRequest',
      status: labOrder.status === 'processing' ? 'active' : 'draft',
      intent: 'order',
      code: {
        text: labOrder.testName
      },
      subject: {
        reference: `Patient/${labOrder.patientId}`
      },
      requester: {
        reference: `Practitioner/${labOrder.doctorId}`
      },
      note: [{
        text: labOrder.notes || ''
      }]
    };
    return syncResource('ServiceRequest', resourceData, labOrder.fhirResourceId);
  }
}

async function createBinary(blobUrl, mimeType) {
  const resourceData = {
    resourceType: 'Binary',
    contentType: mimeType,
    data: Buffer.from(blobUrl).toString('base64')
  };
  const res = await syncResource('Binary', resourceData);
  return res ? res.id : null;
}

async function createDocumentReference(labOrder, binaryId, pdfBlobUrl) {
  const resourceData = {
    resourceType: 'DocumentReference',
    status: 'current',
    docStatus: 'final',
    type: {
      coding: [{
        system: 'http://loinc.org',
        code: '11502-2',
        display: 'Laboratory report'
      }],
      text: labOrder.testName || 'Laboratory Report'
    },
    subject: {
      reference: `Patient/${labOrder.patientId}`
    },
    author: [{
      reference: `Practitioner/${labOrder.doctorId}`
    }],
    content: [{
      attachment: {
        contentType: 'application/pdf',
        url: binaryId ? `Binary/${binaryId}` : pdfBlobUrl,
        title: `${labOrder.testName} Report`
      }
    }]
  };
  
  if (labOrder.fhirResourceId) {
    resourceData.context = {
      related: [{
        reference: `DiagnosticReport/${labOrder.fhirResourceId}`
      }]
    };
  }

  const res = await syncResource('DocumentReference', resourceData);
  return res ? res.id : null;
}

module.exports = {
  syncResource,
  syncEHRRecord,
  syncAppointment,
  syncPrescription,
  syncLabOrder,
  createBinary,
  createDocumentReference
};
