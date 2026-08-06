const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  try {
    await prisma.recall.findMany({});
  } catch (e) {
    console.error(e.message);
  }
}
test();
