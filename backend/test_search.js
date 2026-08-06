const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // 1. Login as dr.smith
    let res = await axios.post(`${baseURL}/auth/login`, {
      userId: 'dr.smith',
      password: 'demo'
    });
    console.log(res.data);
    const drToken = res.data.token || res.data.data?.token;
    console.log('[DR.SMITH] Login successful');

    // 2. Login as receptionist
    res = await axios.post(`${baseURL}/auth/login`, {
      userId: 'receptionist',
      password: 'demo'
    });
    const recToken = res.data.token || res.data.data?.token;
    console.log('[RECEPTIONIST] Login successful');

    // 3. Search patients as receptionist (should see all)
    res = await axios.get(`${baseURL}/intake/patients/search?q=a`, {
      headers: { Authorization: `Bearer ${recToken}` }
    });
    const recPatients = res.data.data;
    console.log(`[RECEPTIONIST] Found ${recPatients.length} patients matching "a"`);
    if (recPatients.length > 0) {
      console.log(` - Sample: ${recPatients[0].name}`);
    }

    // 4. Search patients as dr.smith (should see only his assigned ones)
    res = await axios.get(`${baseURL}/intake/patients/search?q=a`, {
      headers: { Authorization: `Bearer ${drToken}` }
    });
    const drPatients = res.data.data;
    console.log(`[DR.SMITH] Found ${drPatients.length} patients matching "a"`);
    
    // Let's find a patient that the receptionist saw but the doctor did not
    const drPatientIds = drPatients.map(p => p.id);
    const unassignedPatient = recPatients.find(p => !drPatientIds.includes(p.id));

    if (unassignedPatient) {
      console.log(`[TEST] Found unassigned patient: ${unassignedPatient.name} (ID: ${unassignedPatient.id})`);
      
      // 5. Try accessing the patient's records as dr.smith (should fail or return empty/403)
      try {
        console.log(`[DR.SMITH] Attempting to access unassigned patient's records...`);
        const recordsRes = await axios.get(`${baseURL}/ehr/records/${unassignedPatient.id}?orgName=hospital&doctorId=dr.smith`, {
          headers: { Authorization: `Bearer ${drToken}` }
        });
        console.log(`[WARNING] Access granted! Status: ${recordsRes.status}`);
      } catch (err) {
        if (err.response) {
          console.log(`[SUCCESS] Access blocked or failed: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else {
          console.log(`[DR.SMITH] Access failed: ${err.message}`);
        }
      }
    } else {
      console.log('[TEST] No unassigned patients found, could not test chart access restriction.');
    }

  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

runTests();
