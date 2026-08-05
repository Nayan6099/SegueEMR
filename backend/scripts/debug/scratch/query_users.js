const prisma = require('../src/config/prisma');

async function query() {
  try {
    const users = await prisma.user.findMany();
    const patients = await prisma.patient.findMany();
    const doctors = await prisma.doctor.findMany();
    console.log('Users in DB:', users);
    console.log('Patients in DB:', patients);
    console.log('Doctors in DB:', doctors);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

query();
