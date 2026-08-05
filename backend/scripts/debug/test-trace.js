const intakeController = require('./src/controllers/intakeController');
const db = require('./src/config/db');

async function run() {
  const req = {
    body: {
      name: 'Test Trace User',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      contactPhone: '1234567890'
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
    console.log('Testing registerPatient handler...');
    await intakeController.registerPatient(req, res);
  } catch (err) {
    console.error('CRASH:', err);
  } finally {
    process.exit();
  }
}
run();
