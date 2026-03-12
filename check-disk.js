const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const allVideos = await prisma.video.findMany({ select: { id: true, thumbnail: true } });
  
  const toDelete = [];
  
  for (const video of allVideos) {
    // Check if thumbnail is blatantly missing
    if (!video.thumbnail || video.thumbnail.trim() === '') {
      toDelete.push(video.id);
      continue;
    }
    
    // Check if it exists on disk
    // Thumbnail paths appear to be like "/uploads/1773625141800.jpg"
    // Usually mapped to public/uploads/...
    let thumbPath = video.thumbnail;
    if (thumbPath.startsWith('/')) {
      thumbPath = thumbPath.substring(1); // remove leading slash
    }
    const fullPath = path.join(__dirname, 'public', thumbPath);
    
    // Also consider if it starts with http (which means it's an external URL, not a missing local file)
    if (video.thumbnail.startsWith('http')) {
       // if external, we probably assume it's valid unless specified
       continue;
    }

    if (!fs.existsSync(fullPath)) {
      toDelete.push(video.id);
    }
  }

  console.log(`Found ${allVideos.length} total videos.`);
  console.log(`Found ${toDelete.length} videos with missing thumbnail files on disk.`);

  if (toDelete.length > 0) {
    console.log('Deleting these videos...');
    const result = await prisma.video.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${result.count} videos.`);
  }
}
main().finally(() => prisma.$disconnect());
