const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const userId = 'real_patient_777';
  const patientId = 'PAT-REAL-999-UUID';
  
  // Create user
  const hashedPassword = await bcrypt.hash('demo', 10);
  
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'realpatient777@segueemr.local',
      username: 'real_patient_777',
      passwordHash: hashedPassword,
      role: 'patient',
      fullName: 'Real Test Patient',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create patient
  await prisma.patient.upsert({
    where: { id: patientId },
    update: {},
    create: {
      id: patientId,
      userId: userId,
      name: 'Real Test Patient',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '555-0199',
      contactInfo: 'real777@segueemr.local',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Clear old dummy data
  await prisma.appointment.deleteMany({ where: { patientId } });
  await prisma.prescription.deleteMany({ where: { patientId } });
  await prisma.labOrder.deleteMany({ where: { patientId } });
  await prisma.allergy.deleteMany({ where: { patientId } });

  // Appointment
  await prisma.appointment.create({
    data: {
      id: 'APT-TEST-001',
      patientId: patientId,
      patientName: 'Real Test Patient',
      doctorId: 'dr.smith',
      doctorName: 'Dr. Smith',
      scheduledTime: new Date(),
      status: 'scheduled',
      notes: 'Checkup for real user'
    }
  });

  // Prescription
  await prisma.prescription.create({
    data: {
      id: 'RX-TEST-001',
      patientId: patientId,
      patientName: 'Real Test Patient',
      doctorId: 'dr.smith',
      doctorName: 'Dr. Smith',
      diagnosis: 'Low T',
      status: 'active',
      medications: {
        create: {
          name: 'Testosterone',
          dosage: '100mg',
          frequency: 'daily',
          duration: '30 days'
        }
      }
    }
  });

  // Lab Order
  await prisma.labOrder.create({
    data: {
      id: 'LAB-TEST-001',
      patientId: patientId,
      patientName: 'Real Test Patient',
      doctorId: 'dr.smith',
      testName: 'Blood Test',
      status: 'pending',
      critical: false
    }
  });
  
  // Allergy
  await prisma.allergy.create({
    data: {
      id: 'ALG-TEST-001',
      patientId: patientId,
      allergen: 'Peanuts',
      severity: 'High',
      reaction: 'Anaphylaxis'
    }
  });

  console.log('Test patient created successfully with different userId and patientId!');
  console.log('Login: real_user_777 / demo');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
