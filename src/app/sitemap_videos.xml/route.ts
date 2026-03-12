import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEOS_PER_PAGE = 5000;

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
        const imgUrl = video.thumbnail.startsWith("http") ? video.thumbnail : `${baseUrl}${video.thumbnail}`;
        const contentUrl = video.embedUrl.startsWith("http") ? video.embedUrl : `${baseUrl}${video.embedUrl}`;
        const safeTitle = video.title
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/video/${video.id}/${video.slug}</loc>\n`;
        xml += `    <lastmod>${video.createdAt.toISOString()}</lastmod>\n`;
        xml += `    <video:video>\n`;
        xml += `      <video:thumbnail_loc>${imgUrl}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${safeTitle}</video:title>\n`;
        xml += `      <video:description>Watch ${safeTitle} HD video on ILOVEDESI.</video:description>\n`;
        xml += `      <video:content_loc>${contentUrl}</video:content_loc>\n`;
        if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        xml += `      <video:publication_date>${video.createdAt.toISOString()}</video:publication_date>\n`;
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
