import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const sitemaps = [
        `${baseUrl}/sitemap_pages.xml`,
        `${baseUrl}/sitemap_categories.xml`,
        `${baseUrl}/sitemap_tags.xml`,
        `${baseUrl}/sitemap_videos_1.xml`,
    ];

    for (const sitemap of sitemaps) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>${sitemap}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "text/xml" },
    });
}
