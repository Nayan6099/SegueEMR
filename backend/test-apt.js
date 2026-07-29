const axios = require('axios');

async function test() {
const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      userId: 'receptionist',
      password: 'demo',
      role: 'receptionist'
    });
    
    const token = loginRes.data.token;
    console.log('Logged in, testing appointment creation...');

    const res = await axios.post('http://localhost:5000/api/appointments', {
      patientId: 'PAT-123',
      patientName: 'Test Patient',
      doctorId: 'DR-dr.smith',
      doctorName: 'Dr Smith',
      scheduledAt: '2026-07-30T10:00:00Z',
      notes: 'test notes',
      status: 'scheduled'
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR:', err.response?.status, err.response?.data || err.message);
  }
}

test();
}

test();
