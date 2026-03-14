import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEOS_PER_PAGE = 5000;

function escapeXml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * VIDEOS_PER_PAGE;

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
        skip,
        take: VIDEOS_PER_PAGE,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

    for (const video of videos) {
        const safeTitle = escapeXml(video.title);

        // ✅ Thumbnail: If stored externally, route through our proxy so Google can always fetch it
        let thumbUrl: string;
        if (video.thumbnail.startsWith("/uploads/") || video.thumbnail.startsWith("/thumbs/")) {
            // Already on our server — use directly
            thumbUrl = `${baseUrl}${video.thumbnail}`;
        } else if (video.thumbnail.startsWith("http")) {
            // External URL — pipe through our proxy so Google isn't blocked
            thumbUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(video.thumbnail)}`;
        } else {
            thumbUrl = `${baseUrl}${video.thumbnail}`;
        }

        // ✅ Content URL: Always use our own watch page (Google accepts page URL as player_loc alternative)
        // If the embedUrl is a direct .mp4 on our server, use it directly as content_loc
        let playerLoc: string;
        let contentLoc: string | null = null;
        if (video.embedUrl.startsWith("/uploads/")) {
            // Direct MP4 on our server — use as content_loc (best for indexing)
            contentLoc = `${baseUrl}${video.embedUrl}`;
            playerLoc = `${baseUrl}/video/${video.id}/${video.slug}`;
        } else {
            // External embed — use our watch page as player_loc
            playerLoc = `${baseUrl}/video/${video.id}/${video.slug}`;
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

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "text/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
    });
}
