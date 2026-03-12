const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
  const v = await prisma.video.findFirst({ where: { slug: { contains: 'desi-ladki-sex' } }});
  if (v) {
      console.log('Title:', v.title, '\nThumb:', v.thumbnail);
      const path = './public' + v.thumbnail;
      console.log('Exists:', fs.existsSync(path));
  } else {
      console.log('Not found in DB');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
