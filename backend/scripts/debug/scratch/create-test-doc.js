const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDoctor() {
  const username = 'testdoctor';
  const password = 'password123';
  
  // check if exists
  let user = await prisma.user.findFirst({ where: { username } });
  
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        username,
        email: 'doctor@test.com',
        passwordHash,
        role: 'doctor',
        fullName: 'Test Doctor'
      }
    });
    
    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: 'General',
        licenseNumber: 'LIC12345'
      }
    });
    console.log('Created doctor:', username, 'with password:', password);
  } else {
    // update password to be sure
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    console.log('Updated doctor password:', username, 'with password:', password);
  }
}

createDoctor().catch(console.error).finally(() => prisma.$disconnect());
