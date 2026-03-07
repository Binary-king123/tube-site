import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tubex.com';

    // Fetch all videos
    const videos = await db.video.findMany({
        select: {
            id: true,
            slug: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Fetch all categories
    const categories = await db.category.findMany({
        select: {
            slug: true,
        },
    });

    // 1. Static Routes
    const staticRoutes = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'always' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
    ];

    // 2. Dynamic Video Routes
    const videoRoutes = videos.map((video: any) => ({
        url: `${baseUrl}/video/${video.id}/${video.slug}`,
        lastModified: video.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    // 3. Dynamic Category Routes
    const categoryRoutes = categories.map((category: any) => ({
        url: `${baseUrl}/search?q=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...videoRoutes];
}
