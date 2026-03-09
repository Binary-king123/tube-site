import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
// @ts-ignore
import ffprobeStatic from "ffprobe-static";
import fs from "fs";
import path from "path";

// Ensure FFmpeg is available in the environment
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}
if (ffprobeStatic && ffprobeStatic.path) {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Quick check if the URL is a direct media file
        if (url.match(/\.(mp4|webm|mkv|m3u8)($|\?)/i)) {
            const filenameRegex = /\/([^/?#]+)\.[a-z0-9]+($|\?)/i;
            let rawTitle = url.match(filenameRegex)?.[1] || "Direct Video";
            rawTitle = rawTitle.replace(/[-_]/g, " ");

            const cleanTitle = rawTitle.trim();
            const slug = cleanTitle.toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .replace(/\s+/g, "-")
                .substring(0, 80);

            // Generate thumbnail using FFmpeg
            let thumbnailUrl = null;
            let videoDuration = null;

            try {
                const thumbnailFilename = `thumb-${Date.now()}.png`;
                const uploadDir = path.join(process.cwd(), "public", "uploads", "thumbnails");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // First get video duration to see if we can extract it
                await new Promise((resolve, reject) => {
                    ffmpeg.ffprobe(url, (err: Error | null, metadata: ffmpeg.FfprobeData) => {
                        if (!err && metadata && metadata.format && metadata.format.duration) {
                            videoDuration = Math.round(metadata.format.duration);
                        }
                        resolve(true); // Don't crash if ffprobe fails
                    });
                });

                // Then take a screenshot at the 10% mark to avoid black intro screens
                await new Promise((resolve, reject) => {
                    ffmpeg(url)
                        .on('end', () => resolve(true))
                        .on('error', (err: Error) => {
                            console.error("FFMPEG extraction error:", err);
                            resolve(false); // Fail gracefully if stream has issues
                        })
                        .screenshots({
                            count: 1,
                            timestamps: ['10%'],
                            filename: thumbnailFilename,
                            folder: uploadDir,
                            size: '640x360'
                        });
                });

                // Confirm file was created successfully
                if (fs.existsSync(path.join(uploadDir, thumbnailFilename))) {
                    thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
                }

            } catch (ffmpegErr) {
                console.error("Failed to generate MP4 thumbnail:", ffmpegErr);
                // System should proceed and return null thumbnail instead of crashing the API
            }

            return NextResponse.json({
                thumbnail: thumbnailUrl,
                title: cleanTitle,
                description: null,
                duration: videoDuration,
                slug,
            });
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
