const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.updateMany({
    where: { username: 'test_doc' },
    data: { passwordHash }
  });
  console.log('Password reset for test_doc to password123');
}

reset().finally(() => prisma.$disconnect());
