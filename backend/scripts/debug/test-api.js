const axios = require('axios');

async function test() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api' });

    // 1. Login
    console.log('Logging in as real_patient_777...');
    const loginRes = await api.post('/auth/login', {
      userId: 'real_patient_777',
      password: 'demo',
      role: 'patient',
      orgName: 'patient'
    });
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('Login successful. patientId in token payload:', user.patientId);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const patientId = user.patientId;

    // 2. Test endpoints that use patientId
    console.log('\nFetching Appointments...');
    const apts = await api.get(`/appointments?patientId=${patientId}`);
    const aptsList = apts.data.data || apts.data;
    console.log(aptsList.length > 0 ? `PASS: Found ${aptsList.length} appointment(s). Notes: ${aptsList[0].notes || aptsList[0].reason}` : 'FAIL: No appointments found');

    console.log('\nFetching Prescriptions...');
    const rx = await api.get(`/prescriptions?patientId=${patientId}`);
    const rxList = rx.data.data || rx.data;
    console.log(rxList.length > 0 ? `PASS: Found ${rxList.length} prescription(s). Status: ${rxList[0].status}` : 'FAIL: No prescriptions found');

    console.log('\nFetching Lab Orders...');
    const labs = await api.get(`/lab/orders?patientId=${patientId}`);
    const labsList = labs.data.data || labs.data;
    console.log(labsList.length > 0 ? `PASS: Found ${labsList.length} lab order(s). Test: ${labsList[0].testName || labsList[0].testType}` : 'FAIL: No lab orders found');

    console.log('\nFetching Allergies...');
    const allergies = await api.get(`/patient/allergies?patientId=${patientId}`);
    const algList = allergies.data.data || allergies.data;
    console.log(algList.length > 0 ? `PASS: Found ${algList.length} allergy(s). Allergen: ${algList[0].allergen}` : 'FAIL: No allergies found');

    // 3. Test sending a message
    console.log('\nSending message from patient to doctor...');
    await api.post('/patient/messages', {
      senderId: patientId, // The fix we applied
      receiverId: 'dr.smith',
      content: 'Hello Doctor from API test'
    });
    console.log('PASS: Message sent using patientId');

  } catch (e) {
    console.error('Test failed:', e.response?.data || e.message);
  }
}

test();
