const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(u => console.log('USERS:', u.map(x => x.username + ':' + x.role))).finally(() => prisma.$disconnect());
