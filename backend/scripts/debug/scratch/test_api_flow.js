const axios = require('axios');
const prisma = require('../src/config/prisma');

const API_BASE = 'http://localhost:5000/api';

async function testFlow() {
  console.log('--- STARTING END-TO-END WRITE TEST ---');
  
  try {
    // Clean up previous test records if any exist to ensure a clean slate
    console.log('Cleaning up previous test records from DB...');
    await prisma.appointment.deleteMany({ where: { doctorId: 'doc_e2e_test' } });
    await prisma.prescription.deleteMany({ where: { doctorId: 'doc_e2e_test' } });
    await prisma.labOrder.deleteMany({ where: { doctorId: 'doc_e2e_test' } });
    await prisma.doctor.deleteMany({ where: { id: 'doc_e2e_test' } });
    await prisma.patient.deleteMany({ where: { name: 'E2E Patient' } });
    await prisma.user.deleteMany({ where: { id: 'doc_e2e_test' } });
    console.log('✓ Cleanup done.');

    // 1. Register a Doctor
    console.log('\n[1] Registering a new Doctor via POST /api/ehr/register-user...');
    const docRes = await axios.post(`${API_BASE}/ehr/register-user`, {
      userId: 'doc_e2e_test',
      name: 'E2E Doctor',
      orgName: 'hospital',
      role: 'doctor',
      metadata: {
        specialization: 'Pediatrics',
        licenseNumber: 'LIC-E2E-999'
      }
    });
    console.log('Doctor Registration Response:', docRes.data);

    // 2. Register a Patient
    console.log('\n[2] Registering a new Patient via POST /api/intake/patients/register...');
    const patRes = await axios.post(`${API_BASE}/intake/patients/register`, {
      name: 'E2E Patient',
      dateOfBirth: '2000-01-01',
      gender: 'Male',
      contactPhone: '999-999-9999',
      contactEmail: 'e2e_patient@test.com'
    });
    console.log('Patient Registration Response:', patRes.data);
    const generatedPatientId = patRes.data.data.id;
    console.log(`Generated Patient ID: ${generatedPatientId}`);

    // 3. Create an Appointment referencing both
    console.log('\n[3] Creating an Appointment via POST /api/appointments...');
    const aptRes = await axios.post(`${API_BASE}/appointments`, {
      patientId: generatedPatientId,
      patientName: 'E2E Patient',
      doctorId: 'doc_e2e_test',
      doctorName: 'E2E Doctor',
      scheduledAt: '2026-09-01T10:00:00.000Z',
      notes: 'E2E write test appointment',
      status: 'scheduled',
      createdBy: 'doc_e2e_test'
    });
    console.log('Appointment Creation Response:', aptRes.data);
    const generatedAptId = aptRes.data.data.id;

    // 4. Create a Prescription referencing both
    console.log('\n[4] Creating a Prescription via POST /api/prescriptions...');
    const rxRes = await axios.post(`${API_BASE}/prescriptions`, {
      patientId: generatedPatientId,
      patientName: 'E2E Patient',
      doctorId: 'doc_e2e_test',
      doctorName: 'E2E Doctor',
      diagnosis: 'Common Cold',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days'
        }
      ]
    });
    console.log('Prescription Creation Response:', rxRes.data);
    const generatedRxId = rxRes.data.data.id;

    // 5. Create a Lab Order referencing both
    console.log('\n[5] Creating a Lab Order via POST /api/lab/orders...');
    const labRes = await axios.post(`${API_BASE}/lab/orders`, {
      patientId: generatedPatientId,
      patientName: 'E2E Patient',
      doctorId: 'doc_e2e_test',
      testName: 'Liver Function Test',
      notes: 'Routine lab check'
    });
    console.log('Lab Order Creation Response:', labRes.data);
    const generatedLabId = labRes.data.data.id;

    // 6. Direct Database verification checks
    console.log('\n--- VERIFYING REFERENTIAL INTEGRITY VIA PRISMA DIRECT QUERY ---');
    
    const dbDoctor = await prisma.doctor.findUnique({
      where: { id: 'doc_e2e_test' }
    });
    const dbPatient = await prisma.patient.findUnique({
      where: { id: generatedPatientId }
    });
    const dbAppointment = await prisma.appointment.findUnique({
      where: { id: generatedAptId }
    });
    const dbPrescription = await prisma.prescription.findUnique({
      where: { id: generatedRxId },
      include: { medications: true }
    });
    const dbLabOrder = await prisma.labOrder.findUnique({
      where: { id: generatedLabId }
    });

    console.log('\n[DB Query Result] Doctor Record:');
    console.log(JSON.stringify(dbDoctor, null, 2));

    console.log('\n[DB Query Result] Patient Record:');
    console.log(JSON.stringify(dbPatient, null, 2));

    console.log('\n[DB Query Result] Appointment Record (Checking FKs):');
    console.log(JSON.stringify(dbAppointment, null, 2));
    
    console.log('\n[DB Query Result] Prescription Record (Checking FKs):');
    console.log(JSON.stringify(dbPrescription, null, 2));

    console.log('\n[DB Query Result] Lab Order Record (Checking FKs):');
    console.log(JSON.stringify(dbLabOrder, null, 2));

    const fkCheckPassed = 
      dbAppointment.patientId === generatedPatientId &&
      dbAppointment.doctorId === 'doc_e2e_test' &&
      dbPrescription.patientId === generatedPatientId &&
      dbPrescription.doctorId === 'doc_e2e_test' &&
      dbLabOrder.patientId === generatedPatientId &&
      dbLabOrder.doctorId === 'doc_e2e_test';

    if (fkCheckPassed) {
      console.log('\n✓ SUCCESS: All foreign key relations point correctly to the created Patient and Doctor rows!');
    } else {
      console.log('\n✗ FAILURE: Some foreign keys did not match the expected IDs!');
    }

  } catch (error) {
    console.error('Error during end-to-end test:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
}

testFlow();
