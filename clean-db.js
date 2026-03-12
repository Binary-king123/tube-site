const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Analyzing database for invalid or missing thumbnails...');

  // Find all videos
  const allVideos = await prisma.video.findMany({
    select: { id: true, title: true, thumbnail: true }
  });

  const toDelete = [];

  for (const video of allVideos) {
    if (!video.thumbnail || 
        video.thumbnail.trim() === '' || 
        video.thumbnail === 'null' || 
        video.thumbnail === 'undefined' ||
        video.thumbnail.includes('failed') ||
        video.thumbnail.length < 5) {
      toDelete.push(video.id);
    }
  }

  console.log(`Found ${allVideos.length} total videos.`);
  console.log(`Found ${toDelete.length} videos with missing or failed thumbnails.`);

  if (toDelete.length > 0) {
    console.log('Deleting these videos...');
    const result = await prisma.video.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log(`Deleted ${result.count} videos.`);
  } else {
    console.log('No videos to delete. All videos have valid thumbnails!');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
