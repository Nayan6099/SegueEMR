require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with presentation-ready demo data...');
    const passwordHash = await bcrypt.hash('demo', 10);

    // 1. Seed Users
    const drUser = await prisma.user.upsert({
        where: { username: 'dr.smith' },
        update: { passwordHash },
        create: { id: 'dr.smith', username: 'dr.smith', email: 'dr.smith@segueemr.local', passwordHash, role: 'doctor', fullName: 'Dr. Smith', status: 'active' }
    });

    const doc = await prisma.doctor.upsert({
        where: { userId: drUser.id },
        update: {},
        create: { id: 'DR-dr.smith', userId: drUser.id, name: 'Dr. Smith', specialization: 'General Physician', licenseNumber: 'LIC-12345', consultationFee: 50.0 }
    });

    await prisma.user.upsert({
        where: { username: 'receptionist1' },
        update: { passwordHash },
        create: { id: 'receptionist1', username: 'receptionist1', email: 'receptionist@segueemr.local', passwordHash, role: 'receptionist', fullName: 'Demo Receptionist', status: 'active' }
    });

    await prisma.user.upsert({
        where: { username: 'labtech1' },
        update: { passwordHash },
        create: { id: 'labtech1', username: 'labtech1', email: 'lab@segueemr.local', passwordHash, role: 'lab_technician', fullName: 'Demo Lab Tech', status: 'active' }
    });

    await prisma.user.upsert({
        where: { username: 'pharmacist1' },
        update: { passwordHash },
        create: { id: 'pharmacist1', username: 'pharmacist1', email: 'pharmacy@segueemr.local', passwordHash, role: 'pharmacist', fullName: 'Demo Pharmacist', status: 'active' }
    });

    // 2. Seed Medicines
    const medicines = [
        { name: 'Paracetamol', stock: 1000, reorderThreshold: 100, expiryDate: new Date('2028-12-31') },
        { name: 'Azithromycin', stock: 500, reorderThreshold: 50, expiryDate: new Date('2027-10-15') },
        { name: 'Vitamin C', stock: 2000, reorderThreshold: 200, expiryDate: new Date('2029-05-20') }
    ];
    for (const med of medicines) {
        await prisma.medicine.upsert({
            where: { name: med.name },
            update: { stock: med.stock },
            create: { name: med.name, stock: med.stock, reorderThreshold: med.reorderThreshold, expiryDate: med.expiryDate }
        });
    }

    // 3. Seed Realistic Patients
    const patients = [
        { id: 'PAT-001', name: 'Alice Johnson', dob: '1985-04-12', gender: 'Female', phone: '555-0101' },
        { id: 'PAT-002', name: 'Bob Smith', dob: '1978-11-22', gender: 'Male', phone: '555-0102' },
        { id: 'PAT-003', name: 'Charlie Davis', dob: '1992-07-30', gender: 'Male', phone: '555-0103' }
    ];

    for (const p of patients) {
        await prisma.patient.upsert({
            where: { id: p.id },
            update: {},
            create: { id: p.id, name: p.name, dateOfBirth: new Date(p.dob), gender: p.gender, phone: p.phone, contactInfo: p.phone }
        });
    }

    // 4. Seed Appointments
    await prisma.appointment.upsert({
        where: { id: 'APP-001' },
        update: {},
        create: { id: 'APP-001', patientId: 'PAT-001', doctorId: doc.id, scheduledTime: new Date(new Date().getTime() + 86400000), status: 'scheduled', notes: 'Routine Checkup' }
    });
    await prisma.appointment.upsert({
        where: { id: 'APP-002' },
        update: {},
        create: { id: 'APP-002', patientId: 'PAT-002', doctorId: doc.id, scheduledTime: new Date(), status: 'check-in', notes: 'Fever and chills' }
    });

    // 5. Seed Lab Orders & Prescriptions for the completed patient
    await prisma.labOrder.upsert({
        where: { id: 'LAB-001' },
        update: {},
        create: { id: 'LAB-001', patientId: 'PAT-003', patientName: 'Charlie Davis', doctorId: doc.id, testName: 'Complete Blood Count (CBC)', status: 'processing', notes: 'Urgent' }
    });

    await prisma.prescription.upsert({
        where: { id: 'RX-001' },
        update: {},
        create: { 
            id: 'RX-001', 
            patientId: 'PAT-003', 
            patientName: 'Charlie Davis', 
            doctorId: doc.id, 
            doctorName: 'Dr. Smith', 
            status: 'pending',
            medications: {
                create: [
                    { name: 'Azithromycin 500mg', dosage: '1 tablet', frequency: 'daily', duration: '5 days' }
                ]
            }
        }
    });

    console.log('✅ Demo data (patients, appointments, labs, prescriptions) seeded successfully!');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
