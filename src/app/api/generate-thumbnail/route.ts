import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { targetUrl } = body;

        if (!targetUrl || !targetUrl.toLowerCase().endsWith(".mp4")) {
            return NextResponse.json({ error: "Invalid video URL. Must be an .mp4 URL." }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueFilename = `autothumb_${Date.now()}_${Math.floor(Math.random() * 9999)}.jpg`;
        const outputPath = path.join(uploadDir, uniqueFilename);

        // Use the system ffmpeg binary directly.
        // -ss 5: seek to 5 seconds, -frames:v 1: only one frame, -q:v 2: high quality JPEG.
        const ffmpegBin = "/usr/bin/ffmpeg";
        const cmd = `${ffmpegBin} -ss 00:00:10 -i "${targetUrl}" -frames:v 1 -q:v 2 -y "${outputPath}"`;

        // Give it 30 seconds max to grab the frame from the remote MP4
        await execAsync(cmd, { timeout: 30000 });

        if (!fs.existsSync(outputPath)) {
            throw new Error("ffmpeg ran but no thumbnail was created. The video may be too short or unavailable.");
        }

        return NextResponse.json({
            success: true,
            thumbnailUrl: `/uploads/${uniqueFilename}`,
        });

    } catch (error: any) {
        console.error("Thumbnail Generation Error:", error?.message || error);
        return NextResponse.json({ 
            error: error?.message || "Failed to generate thumbnail. Make sure ffmpeg is installed on the server." 
        }, { status: 500 });
    }
}
