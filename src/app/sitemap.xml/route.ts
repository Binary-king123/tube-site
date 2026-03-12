import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEOS_PER_SITEMAP = 5000; // 5,000 per file is well within Google's 50,000 limit

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    // Count total videos to know how many sitemap files we need
    const totalVideos = await db.video.count();
    const totalPages = Math.max(1, Math.ceil(totalVideos / VIDEOS_PER_SITEMAP));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const now = new Date().toISOString();

    // Static pages, categories, tags
    const staticSitemaps = [
        `${baseUrl}/sitemap_pages.xml`,
        `${baseUrl}/sitemap_categories.xml`,
        `${baseUrl}/sitemap_tags.xml`,
    ];

    for (const sitemap of staticSitemaps) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${sitemap}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }

    // Dynamic video sitemaps — one entry per page
    for (let page = 1; page <= totalPages; page++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${baseUrl}/sitemap_videos.xml?page=${page}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "text/xml" },
    });
}
