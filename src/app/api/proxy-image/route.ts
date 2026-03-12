import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    try {
        // Fetch the external image, completely masking our server/domain to bypass basic HotLink protection
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                // Strip the referer to prevent 'desibf.com' from knowing it's us
                "Referer": "" 
            },
        });

        if (!response.ok) {
            return new NextResponse("Failed to fetch image", { status: response.status });
        }

        // Pipe the image buffer exactly as it was returned
        const buffer = Buffer.from(await response.arrayBuffer());
        
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": response.headers.get("content-type") || "image/jpeg",
                "Cache-Control": "public, max-age=86400"
            },
        });
    } catch (error) {
        console.error("Image proxy error:", error);
        return new NextResponse("Server proxy error", { status: 500 });
    }
}
