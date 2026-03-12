import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    const catGroups = await db.video.groupBy({
        by: ["category"],
        where: { category: { not: null } },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
    });

    const categories = catGroups
        .filter((g: any) => g.category && g.category.trim() !== "")
        .map((g: any) => g.category as string);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const category of categories) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/categories?cat=${encodeURIComponent(category)}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
