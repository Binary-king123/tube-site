import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeXml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

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
        orderBy: { createdAt: "desc" },
        take: 40000,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

    for (const video of videos) {
        const safeTitle = escapeXml(video.title);

        // ✅ Thumbnail: Route external thumbs through our proxy so Google can always fetch them
        let thumbUrl: string;
        if (video.thumbnail.startsWith("/uploads/") || video.thumbnail.startsWith("/thumbs/")) {
            thumbUrl = `${baseUrl}${video.thumbnail}`;
        } else if (video.thumbnail.startsWith("http")) {
            thumbUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(video.thumbnail)}`;
        } else {
            thumbUrl = `${baseUrl}${video.thumbnail}`;
        }

        // ✅ Content URL: Always use our watch page as player_loc
        let playerLoc = `${baseUrl}/video/${video.id}/${video.slug}`;
        let contentLoc: string | null = null;
        if (video.embedUrl.startsWith("/uploads/")) {
            contentLoc = `${baseUrl}${video.embedUrl}`;
        }

        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/video/${video.id}/${video.slug}</loc>\n`;
        xml += `    <lastmod>${video.createdAt.toISOString()}</lastmod>\n`;
        xml += `    <video:video>\n`;
        xml += `      <video:thumbnail_loc>${thumbUrl}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${safeTitle}</video:title>\n`;
        xml += `      <video:description>Watch ${safeTitle} free HD video on ILOVEDESI.</video:description>\n`;
        xml += `      <video:player_loc>${playerLoc}</video:player_loc>\n`;
        if (contentLoc) {
            xml += `      <video:content_loc>${contentLoc}</video:content_loc>\n`;
        }
        if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        xml += `      <video:publication_date>${video.createdAt.toISOString()}</video:publication_date>\n`;
        xml += `      <video:family_friendly>no</video:family_friendly>\n`;
        xml += `    </video:video>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
