import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

// Set fluent-ffmpeg to use the locally installed binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const maxDuration = 60; // Allow function to run up to 60s for massive files
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { targetUrl } = body;

        if (!targetUrl || !targetUrl.endsWith(".mp4")) {
            return NextResponse.json({ error: "Invalid video URL. Must be an MP4." }, { status: 400 });
        }

        // Directories
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueFilename = `autothumb_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        const outputPath = path.join(uploadDir, uniqueFilename);

        // We wrap fluent-ffmpeg in a Promise
        await new Promise<void>((resolve, reject) => {
            ffmpeg(targetUrl)
                .on("end", () => {
                    resolve();
                })
                .on("error", (err) => {
                    console.error("FFMPEG Error:", err);
                    reject(err);
                })
                .screenshots({
                    timestamps: ["00:00:05.000"], // Take screenshot exactly at 5 seconds
                    filename: uniqueFilename,
                    folder: uploadDir,
                    size: "600x?" // Scale to roughly match tube site thumbnails
                });
        });

        // Ensure file was actually created
        if (!fs.existsSync(outputPath)) {
            throw new Error("FFMPEG completed but no file was written.");
        }

        return NextResponse.json({ 
            success: true, 
            thumbnailUrl: `/uploads/${uniqueFilename}` 
        });

    } catch (error: any) {
        console.error("Thumbnail Generation Failed:", error);
        return NextResponse.json({ error: error.message || "Failed to generate thumbnail." }, { status: 500 });
    }
}
