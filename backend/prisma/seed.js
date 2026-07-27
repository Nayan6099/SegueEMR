require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with demo data...');
    const passwordHash = await bcrypt.hash('demo', 10);

    // 1. Seed Doctor (userId: 'dr.smith')
    const drUser = await prisma.user.upsert({
        where: { username: 'dr.smith' },
        update: { passwordHash },
        create: {
            id: 'dr.smith',
            username: 'dr.smith',
            email: 'dr.smith@segueemr.local',
            passwordHash,
            role: 'doctor',
            fullName: 'Dr. Smith',
            status: 'active'
        }
    });

    await prisma.doctor.upsert({
        where: { userId: drUser.id },
        update: {},
        create: {
            id: 'DR-dr.smith',
            userId: drUser.id,
            name: 'Dr. Smith',
            specialization: 'General Physician',
            licenseNumber: 'LIC-12345',
            consultationFee: 50.0
        }
    });
    console.log('✅ Doctor seeded (dr.smith / DR-dr.smith)');

    // 2. Seed Receptionist
    await prisma.user.upsert({
        where: { username: 'receptionist1' },
        update: { passwordHash },
        create: {
            id: 'receptionist1',
            username: 'receptionist1',
            email: 'receptionist@segueemr.local',
            passwordHash,
            role: 'receptionist',
            fullName: 'Demo Receptionist',
            status: 'active'
        }
    });
    console.log('✅ Receptionist seeded (receptionist1)');

    // 3. Seed Lab Technician
    await prisma.user.upsert({
        where: { username: 'labtech1' },
        update: { passwordHash },
        create: {
            id: 'labtech1',
            username: 'labtech1',
            email: 'lab@segueemr.local',
            passwordHash,
            role: 'lab_technician',
            fullName: 'Demo Lab Tech',
            status: 'active'
        }
    });
    console.log('✅ Lab Technician seeded (labtech1)');

    // 4. Seed Pharmacist
    await prisma.user.upsert({
        where: { username: 'pharmacist1' },
        update: { passwordHash },
        create: {
            id: 'pharmacist1',
            username: 'pharmacist1',
            email: 'pharmacy@segueemr.local',
            passwordHash,
            role: 'pharmacist',
            fullName: 'Demo Pharmacist',
            status: 'active'
        }
    });
    console.log('✅ Pharmacist seeded (pharmacist1)');

    // 5. Seed Patient (Rahul Sharma) - so that it exists before demo begins if needed, 
    // although Receptionist will create it. Actually, letting receptionist create it is part of the demo flow.
    // We will leave patient creation to the receptionist during the demo!

    // 6. Seed Medicines
    const medicines = [
        { name: 'Paracetamol', stock: 1000, reorderThreshold: 100, expiryDate: new Date('2028-12-31') },
        { name: 'Azithromycin', stock: 500, reorderThreshold: 50, expiryDate: new Date('2027-10-15') },
        { name: 'Vitamin C', stock: 2000, reorderThreshold: 200, expiryDate: new Date('2029-05-20') }
    ];

    for (const med of medicines) {
        await prisma.medicine.upsert({
            where: { name: med.name },
            update: { stock: med.stock },
            create: med
        });
    }
    console.log('✅ Medicines seeded (Paracetamol, Azithromycin, Vitamin C)');

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch(e => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
