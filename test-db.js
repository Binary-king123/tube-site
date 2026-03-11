const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vids = await prisma.video.findMany({ take: 5, orderBy: { createdAt: 'desc' }});
  vids.forEach(v => console.log('Title:', v.title, '\nThumb:', v.thumbnail));
}
main().catch(console.error).finally(() => prisma.$disconnect());
