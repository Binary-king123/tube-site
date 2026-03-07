import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Fetch the page HTML from the source URL
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch page" }, { status: 400 });
        }

        const html = await res.text();

        // Extract OG/meta tags from the raw HTML with simple regex
        const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];

        const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
            || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

        const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];

        // Extract duration from og:video:duration or data-duration attributes
        const ogDuration = html.match(/<meta[^>]+property=["']video:duration["'][^>]+content=["']([^"']+)["']/i)?.[1]
            || html.match(/data-duration=["']([0-9]+)["']/i)?.[1];

        // Auto-generate slug from title
        const cleanTitle = ogTitle?.replace(/\s*[-|–]\s*(xhamster|xvideos|xnxx|pornhub|redtube)[^$]*/gi, "").trim();
        const slug = cleanTitle?.toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 80) || "";

        return NextResponse.json({
            thumbnail: ogImage || null,
            title: cleanTitle || null,
            description: ogDescription || null,
            duration: ogDuration ? parseInt(ogDuration) : null,
            slug,
        });

    } catch (err) {
        console.error("Scrape error:", err);
        return NextResponse.json({ error: "Could not scrape URL" }, { status: 500 });
    }
}
