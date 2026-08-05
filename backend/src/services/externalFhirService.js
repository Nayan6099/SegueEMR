const axios = require('axios');
require('dotenv').config();
const logger = require('../utils/logger');

const {
  EXTERNAL_LAB_FHIR_URL,
  EXTERNAL_LAB_TOKEN_URL,
  EXTERNAL_LAB_CLIENT_ID,
  EXTERNAL_LAB_CLIENT_SECRET,
  EXTERNAL_LAB_SCOPE,

  EXTERNAL_PHARMACY_FHIR_URL,
  EXTERNAL_PHARMACY_TOKEN_URL,
  EXTERNAL_PHARMACY_CLIENT_ID,
  EXTERNAL_PHARMACY_CLIENT_SECRET,
  EXTERNAL_PHARMACY_SCOPE
} = process.env;

// Token caching states
let labAccessToken = null;
let labTokenExpiresAt = 0;

let pharmacyAccessToken = null;
let pharmacyTokenExpiresAt = 0;

/**
 * Gets OAuth2 access token for a partner using client credentials flow
 */
async function getPartnerToken(type) {
  const now = Date.now();
  
  if (type === 'lab') {
    if (labAccessToken && labTokenExpiresAt > now + 300000) {
      return labAccessToken;
    }
    if (!EXTERNAL_LAB_TOKEN_URL || !EXTERNAL_LAB_CLIENT_ID || !EXTERNAL_LAB_CLIENT_SECRET) {
      return null;
    }
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', EXTERNAL_LAB_CLIENT_ID);
      params.append('client_secret', EXTERNAL_LAB_CLIENT_SECRET);
      if (EXTERNAL_LAB_SCOPE) {
        params.append('scope', EXTERNAL_LAB_SCOPE);
      }
      const response = await axios.post(EXTERNAL_LAB_TOKEN_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      });
      labAccessToken = response.data.access_token;
      labTokenExpiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
      return labAccessToken;
    } catch (error) {
      logger.error('[externalFhir:getPartnerToken]', { type: 'lab', error: error.response?.data || error.message });
      return null;
    }
  } else if (type === 'pharmacy') {
    if (pharmacyAccessToken && pharmacyTokenExpiresAt > now + 300000) {
      return pharmacyAccessToken;
    }
    if (!EXTERNAL_PHARMACY_TOKEN_URL || !EXTERNAL_PHARMACY_CLIENT_ID || !EXTERNAL_PHARMACY_CLIENT_SECRET) {
      return null;
    }
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', EXTERNAL_PHARMACY_CLIENT_ID);
      params.append('client_secret', EXTERNAL_PHARMACY_CLIENT_SECRET);
      if (EXTERNAL_PHARMACY_SCOPE) {
        params.append('scope', EXTERNAL_PHARMACY_SCOPE);
      }
      const response = await axios.post(EXTERNAL_PHARMACY_TOKEN_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      });
      pharmacyAccessToken = response.data.access_token;
      pharmacyTokenExpiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
      return pharmacyAccessToken;
    } catch (error) {
      logger.error('[externalFhir:getPartnerToken]', { type: 'pharmacy', error: error.response?.data || error.message });
      return null;
    }
  }
  return null;
}

/**
 * Submits a FHIR resource to the partner's server
 */
async function submitToPartner(type, resourceType, resourceData) {
  // Log the complete outbound JSON payload for verification
  logger.info('[externalFhir:submitToPartner]', { msg: `Payload for external ${type} (${resourceType})`, data: resourceData });

  const baseUrl = type === 'lab' ? EXTERNAL_LAB_FHIR_URL : EXTERNAL_PHARMACY_FHIR_URL;
  if (!baseUrl) {
    logger.warn('[externalFhir:submitToPartner]', { msg: `Submit skipped: External ${type} FHIR URL is not configured.` });
    return null;
  }

  const token = await getPartnerToken(type);
  const headers = {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}/${resourceType}`;

  try {
    const response = await axios.post(url, resourceData, { headers, timeout: 5000 });
    logger.info('[externalFhir:submitToPartner]', { msg: `Successfully submitted ${resourceType} to external ${type}` });
    return response.data;
  } catch (error) {
    logger.error('[externalFhir:submitToPartner]', { type, resourceType, error: error.response?.data || error.message });
    return null;
  }
}

/**
 * Submit LabOrder ➔ ServiceRequest
 */
async function submitLabOrder(labOrder) {
  const resourceData = {
    resourceType: 'ServiceRequest',
    status: 'active',
    intent: 'order',
    category: [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: '108252007',
        display: 'Laboratory procedure'
      }]
    }],
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

  return submitToPartner('lab', 'ServiceRequest', resourceData);
}

/**
 * Submit Prescription ➔ MedicationRequest
 */
async function submitPrescription(prescription) {
  const meds = prescription.medications || [];
  if (meds.length === 0) return null;

  const firstMed = meds[0];
  const medsDesc = meds.map(m => `${m.name} (Dosage: ${m.dosage || ''}, Frequency: ${m.frequency || ''}, Duration: ${m.duration || ''})`).join('; ');

  const resourceData = {
    resourceType: 'MedicationRequest',
    status: 'active',
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

  return submitToPartner('pharmacy', 'MedicationRequest', resourceData);
}

module.exports = {
  submitLabOrder,
  submitPrescription
};
