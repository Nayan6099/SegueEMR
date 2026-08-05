const axios = require('axios');
require('dotenv').config();
const logger = require('../utils/logger');

const {
  DATAVERSE_ENVIRONMENT_URL,
  DATAVERSE_CLIENT_ID,
  DATAVERSE_CLIENT_SECRET,
  DATAVERSE_TENANT_ID,
} = process.env;

let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Gets OAuth2 access token for Azure Dataverse using Client Credentials Flow
 */
async function getAccessToken() {
  const now = Date.now();
  if (accessToken && tokenExpiresAt > now + 300000) {
    return accessToken;
  }

  if (!DATAVERSE_ENVIRONMENT_URL || !DATAVERSE_CLIENT_ID || !DATAVERSE_CLIENT_SECRET || !DATAVERSE_TENANT_ID) {
    throw new Error('Azure Dataverse credentials not fully configured in env.');
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${DATAVERSE_TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', DATAVERSE_CLIENT_ID);
    params.append('client_secret', DATAVERSE_CLIENT_SECRET);
    params.append('scope', `${DATAVERSE_ENVIRONMENT_URL}/.default`);

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    logger.error('[dataverse:getAccessToken]', { error: error.response?.data || error.message });
    throw new Error('Failed to authenticate with Azure Dataverse');
  }
}

/**
 * Sends a POST/PATCH request to Azure Dataverse OData Web API to sync an entity
 */
async function syncEntity(entitySetName, data, id = null) {
  const token = await getAccessToken();
  const url = id 
    ? `${DATAVERSE_ENVIRONMENT_URL}/api/data/v9.2/${entitySetName}(${id})`
    : `${DATAVERSE_ENVIRONMENT_URL}/api/data/v9.2/${entitySetName}`;

  const method = id ? 'PATCH' : 'POST';

  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        ...(id ? { 'If-Match': '*' } : {}),
      },
    });

    return response.data;
  } catch (error) {
    logger.error('[dataverse:syncEntity]', { entitySetName, id, error: error.response?.data || error.message });
    throw new Error(`Dataverse sync failed: ${error.message}`);
  }
}

// User CRUD via contacts entity set
async function findUser(userId) {
  const token = await getAccessToken();
  const filter = `$filter=employeeid eq '${userId}'`;
  const url = `${DATAVERSE_ENVIRONMENT_URL}/api/data/v9.2/contacts?${filter}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    if (response.data.value && response.data.value.length > 0) {
      const item = response.data.value[0];
      return {
        id: item.contactid,
        userId: item.employeeid,
        password: item.jobtitle,
        role: item.department,
        orgName: item.companyname,
        status: item.statecode === 0 ? 'active' : 'inactive',
        metadata: item.description ? JSON.parse(item.description) : {}
      };
    }
    return null;
  } catch (error) {
    logger.error('[dataverse:findUser]', { userId, error: error.response?.data || error.message });
    throw error;
  }
}

async function createUser(user) {
  const payload = {
    employeeid: user.userId,
    jobtitle: user.password,
    department: user.role,
    companyname: user.orgName || 'hospital',
    description: JSON.stringify(user.metadata || {})
  };
  await syncEntity('contacts', payload);
  return user;
}

// Organization CRUD via accounts entity set
async function findOrganization(orgName) {
  const token = await getAccessToken();
  const filter = `$filter=name eq '${orgName}'`;
  const url = `${DATAVERSE_ENVIRONMENT_URL}/api/data/v9.2/accounts?${filter}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    if (response.data.value && response.data.value.length > 0) {
      const item = response.data.value[0];
      return {
        id: item.accountid,
        orgName: item.name,
        departments: item.description ? JSON.parse(item.description) : [],
        accessRules: item.address1_composite ? JSON.parse(item.address1_composite) : []
      };
    }
    return null;
  } catch (error) {
    logger.error('[dataverse:findOrganization]', { orgName, error: error.response?.data || error.message });
    throw error;
  }
}

async function createOrganization(org) {
  const payload = {
    name: org.orgName,
    description: JSON.stringify(org.departments || []),
    address1_composite: JSON.stringify(org.accessRules || [])
  };
  await syncEntity('accounts', payload);
  return org;
}

async function updateOrganization(orgName, updates) {
  const org = await findOrganization(orgName);
  if (!org) {
    throw new Error('Organization not found in Dataverse');
  }
  const payload = {};
  if (updates.departments) {
    payload.description = JSON.stringify(updates.departments);
  }
  if (updates.accessRules) {
    payload.address1_composite = JSON.stringify(updates.accessRules);
  }
  await syncEntity('accounts', payload, org.id);
  return { ...org, ...updates };
}

// Expose staff listing by companyname
async function listStaff(orgName) {
  const token = await getAccessToken();
  const filter = `$filter=companyname eq '${orgName}'`;
  const url = `${DATAVERSE_ENVIRONMENT_URL}/api/data/v9.2/contacts?${filter}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    return (response.data.value || []).map(item => ({
      userId: item.employeeid,
      role: item.department,
      orgName: item.companyname,
      status: item.statecode === 0 ? 'active' : 'inactive'
    }));
  } catch (error) {
    logger.error('[dataverse:listStaff]', { orgName, error: error.response?.data || error.message });
    throw error;
  }
}


// Sync User to Dataverse systemusers
async function syncUserToDataverse(user) {
  const [firstname, ...lastnameParts] = (user.fullName || '').split(' ');
  const payload = {
    domainname: user.email,
    firstname: firstname || user.username,
    lastname: lastnameParts.join(' ') || '.',
    title: user.role,
    employeeid: user.id
  };
  try {
    await syncEntity('systemusers', payload);
    logger.info('[dataverse:syncUser]', { msg: `Successfully synced user ${user.id} to systemuser` });
  } catch (error) {
    logger.warn('[dataverse:syncUser]', { msg: `Failed to sync user ${user.id} to systemuser`, error: error.message });
  }
}

// Sync Patient to Dataverse contacts
async function syncPatientToDataverse(patient) {
  const [firstname, ...lastnameParts] = (patient.name || '').split(' ');
  const payload = {
    firstname: firstname || 'Patient',
    lastname: lastnameParts.join(' ') || '.',
    birthdate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : null,
    gendercode: patient.gender === 'Male' ? 1 : patient.gender === 'Female' ? 2 : 3,
    telephone1: patient.phone || patient.contactInfo || null,
    address1_composite: patient.address || null,
    description: JSON.stringify({
      emergencyContact: patient.emergencyContact,
      bloodGroup: patient.bloodGroup
    })
  };
  try {
    await syncEntity('contacts', payload);
    logger.info('[dataverse:syncPatient]', { msg: `Successfully synced patient ${patient.id} to contact` });
  } catch (error) {
    logger.warn('[dataverse:syncPatient]', { msg: `Failed to sync patient ${patient.id} to contact`, error: error.message });
  }
}

// Sync Doctor to Dataverse bookableresources
async function syncDoctorToDataverse(doctor) {
  const payload = {
    name: doctor.name,
    resourcetype: 1, // Generic / User
    description: JSON.stringify({
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee
    })
  };
  try {
    await syncEntity('bookableresources', payload);
    logger.info('[dataverse:syncDoctor]', { msg: `Successfully synced doctor ${doctor.id} to bookableresource` });
  } catch (error) {
    logger.warn('[dataverse:syncDoctor]', { msg: `Failed to sync doctor ${doctor.id} to bookableresource`, error: error.message });
  }
}

module.exports = {
  getAccessToken,
  syncEntity,
  findUser,
  createUser,
  findOrganization,
  createOrganization,
  updateOrganization,
  listStaff,
  syncUserToDataverse,
  syncPatientToDataverse,
  syncDoctorToDataverse
};

