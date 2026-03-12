import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

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

    xml += `</urlset>`;

    return new NextResponse(xml, { headers: { "Content-Type": "text/xml" } });
}
