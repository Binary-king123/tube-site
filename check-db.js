const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vids = await prisma.video.findMany({ take: 30 });
  console.log('Sample thumbnails:');
  vids.forEach(v => console.log(v.thumbnail));
}
main().finally(() => prisma.$disconnect());
