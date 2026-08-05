const intakeController = require('./src/controllers/intakeController');
const db = require('./src/config/db');

async function run() {
  const req = {
    body: {
      patientId: 'test-patient-id',
      name: 'Test Trace User',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      maritalStatus: 'Single',
      contactPhone: '1234567890',
      reasonForVisit: 'Testing error trace',
      vitals: {}
    },
    user: {
      userId: 'receptionist1',
      role: 'receptionist'
    }
  };
  
  const res = {
    json: (data) => console.log('RES.JSON:', data),
    status: (code) => {
      console.log('RES.STATUS:', code);
      return { json: (data) => console.log('RES.STATUS.JSON:', data) };
    }
  };

  try {
    console.log('Testing createIntake handler...');
    await intakeController.createIntake(req, res);
  } catch (err) {
    console.error('CRASH:', err);
  } finally {
    process.exit();
  }
}
run();
