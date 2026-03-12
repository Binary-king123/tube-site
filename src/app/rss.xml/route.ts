import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    // Fetch the 100 newest videos for the RSS feed
    const videos = await db.video.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 100,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    xml += `<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>ILOVEDESI Latest Videos</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>The latest and greatest desi porn videos added to ILOVEDESI.</description>\n`;
    xml += `    <language>en-us</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

    for (const video of videos) {
        const videoUrl = `${baseUrl}/video/${video.id}/${video.slug}`;
        const imgUrl = video.thumbnail.startsWith("http") ? video.thumbnail : `${baseUrl}${video.thumbnail}`;
        const safeTitle = video.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

        xml += `    <item>\n`;
        xml += `      <title>${safeTitle}</title>\n`;
        xml += `      <link>${videoUrl}</link>\n`;
        xml += `      <guid isPermaLink="true">${videoUrl}</guid>\n`;
        xml += `      <pubDate>${video.createdAt.toUTCString()}</pubDate>\n`;
        xml += `      <description>Watch ${safeTitle} HD video on ILOVEDESI.</description>\n`;
        xml += `      <media:thumbnail url="${imgUrl}" />\n`;
        xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    return new NextResponse(xml, { 
        headers: { 
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800"
        } 
    });
}
