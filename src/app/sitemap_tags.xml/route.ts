import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    type TagRow = { tag: string };
    const tagRows = await db.$queryRaw<TagRow[]>`
        SELECT unnest(tags) AS tag, COUNT(*) AS count
        FROM "Video"
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 50000
    `;
    const tags = tagRows.map(r => r.tag).filter(Boolean);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const tag of tags) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/tags?tag=${encodeURIComponent(tag)}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
