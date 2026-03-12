const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const v = await prisma.video.findFirst({ where: { title: { contains: 'Hot Indian Girl BF' } }});
  console.log(v ? v.thumbnail : 'Not found');
}
main().catch(console.error).finally(() => prisma.$disconnect());
