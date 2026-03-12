import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    const videos = await db.video.findMany({
        select: {
            id: true,
            slug: true,
            title: true,
            thumbnail: true,
            embedUrl: true,
            duration: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 40000, // Safe limit for a single sitemap file (Max 50,000)
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

    for (const video of videos) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/video/${video.id}/${video.slug}</loc>\n`;
        xml += `    <lastmod>${video.createdAt.toISOString()}</lastmod>\n`;
        
        xml += `    <video:video>\n`;
        
        const imgUrl = video.thumbnail.startsWith("http") ? video.thumbnail : `${baseUrl}${video.thumbnail}`;
        xml += `      <video:thumbnail_loc>${imgUrl}</video:thumbnail_loc>\n`;
        
        const safeTitle = video.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
        xml += `      <video:title>${safeTitle}</video:title>\n`;
        xml += `      <video:description>Watch ${safeTitle} HD video on ILOVEDESI.</video:description>\n`;
        
        const contentUrl = video.embedUrl.startsWith("http") ? video.embedUrl : `${baseUrl}${video.embedUrl}`;
        xml += `      <video:content_loc>${contentUrl}</video:content_loc>\n`;
        
        if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        
        xml += `      <video:publication_date>${video.createdAt.toISOString()}</video:publication_date>\n`;
        
        xml += `    </video:video>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
