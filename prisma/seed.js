const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const placeholderVideos = [
    {
        title: "Beautiful Nature Walk in 4K HDR",
        slug: "beautiful-nature-walk-4k-hdr",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk", // SFW placeholder
        thumbnail: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=640&q=80",
        duration: 1240, // 20m 40s
        views: 1250000,
        tags: ["nature", "4k", "relaxing", "walk"],
        category: "Nature",
    },
    {
        title: "Cozy Cabin in the Woods - Rain Sounds",
        slug: "cozy-cabin-woods-rain-sounds",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        thumbnail: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=640&q=80",
        duration: 3600, // 1 hour
        views: 85000,
        tags: ["rain", "cabin", "sleep", "asmr"],
        category: "ASMR",
    },
    {
        title: "Fast Cars Driving in Tokyo at Night",
        slug: "fast-cars-tokyo-night",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        thumbnail: "https://images.unsplash.com/photo-1542044896530-05d3c0541205?auto=format&fit=crop&w=640&q=80",
        duration: 450, // 7m 30s
        views: 3200000,
        tags: ["cars", "tokyo", "night", "driving", "fast"],
        category: "Action",
    },
    {
        title: "Making the Perfect Cup of Coffee",
        slug: "making-perfect-cup-coffee",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        thumbnail: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=640&q=80",
        duration: 180, // 3m
        views: 45000,
        tags: ["coffee", "morning", "tutorial", "brew"],
        category: "Food",
    },
    {
        title: "Exploring the Deep Ocean",
        slug: "exploring-deep-ocean",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        thumbnail: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=640&q=80",
        duration: 5400, // 1h 30m
        views: 920000,
        tags: ["ocean", "fish", "documentary", "deep"],
        category: "Nature",
    },
    {
        title: "City Ambience - New York Street Sounds",
        slug: "city-ambience-new-york-street",
        embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
        thumbnail: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=640&q=80",
        duration: 7200, // 2h
        views: 12000,
        tags: ["city", "new-york", "sounds", "background"],
        category: "ASMR",
    },
];

const categories = [
    { name: "Nature", slug: "nature" },
    { name: "ASMR", slug: "asmr" },
    { name: "Action", slug: "action" },
    { name: "Food", slug: "food" },
];

async function main() {
    console.log('Start seeding...');

    // Clear existing datass
    await prisma.video.deleteMany({});
    await prisma.category.deleteMany({});

    // Seed categories
    for (const c of categories) {
        await prisma.category.create({
            data: c,
        });
    }
    console.log(`Created ${categories.length} categories.`);

    // Seed videos
    for (const v of placeholderVideos) {
        await prisma.video.create({
            data: v,
        });
    }
    console.log(`Created ${placeholderVideos.length} placeholder videos.`);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
