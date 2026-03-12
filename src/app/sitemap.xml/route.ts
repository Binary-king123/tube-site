import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    // Fetch all videos
    const videos = await db.video.findMany({
        select: {
            id: true,
            slug: true,
            title: true,
            thumbnail: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Fetch all categories
    const categories = await db.category.findMany({
        select: { slug: true },
    });

    // Start XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Static Routes
    const staticRoutes = [
        { url: baseUrl, priority: 1.0, changefreq: "always" },
        { url: `${baseUrl}/categories`, priority: 0.8, changefreq: "daily" },
        { url: `${baseUrl}/tags`, priority: 0.8, changefreq: "daily" },
    ];

    for (const route of staticRoutes) {
        xml += `  <url>\n`;
        xml += `    <loc>${route.url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
        xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
        xml += `  </url>\n`;
    }

    // 2. Dynamic Category Routes
    for (const category of categories) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/search?q=${encodeURIComponent(category.slug)}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
    }

    // 3. Dynamic Video Routes with <image:image> tags
    for (const video of videos) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/video/${video.id}/${video.slug}</loc>\n`;
        xml += `    <lastmod>${video.createdAt.toISOString()}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        
        // Ensure thumbnail is full URL for Google Images
        const imgUrl = video.thumbnail.startsWith("http") 
            ? video.thumbnail 
            : `${baseUrl}${video.thumbnail}`;

        // Add Google Image tag
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${imgUrl}</image:loc>\n`;
        // Escape XML entities for title
        const safeTitle = video.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
        xml += `      <image:caption>Watch ${safeTitle} Free HD Porn</image:caption>\n`;
        xml += `      <image:title>${safeTitle}</image:title>\n`;
        xml += `    </image:image>\n`;
        
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
