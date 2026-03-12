const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
  const vids = await prisma.video.findMany({ take: 5, orderBy: { createdAt: 'desc' }});
  vids.forEach(v => {
      console.log('Title:', v.title, '\nThumb:', v.thumbnail);
      if (v.thumbnail.startsWith('/uploads/')) {
          const path = './public' + v.thumbnail;
          console.log('Exists:', fs.existsSync(path));
          if (fs.existsSync(path)) console.log('Size:', fs.statSync(path).size);
      }
      console.log('---');
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
