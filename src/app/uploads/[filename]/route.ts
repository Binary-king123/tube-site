import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    // Basic security to prevent directory traversal
    if (!filename || filename.includes("/") || filename.includes("..")) {
        return new NextResponse("Invalid filename", { status: 400 });
    }

    // Reference the exact folder where our /api/upload saves the files
    const filePath = join(process.cwd(), "public", "uploads", filename);

    if (!existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        // Determine correct Content-Type from extension
        const ext = filename.split(".").pop()?.toLowerCase();
        let contentType = "image/jpeg";
        if (ext === "png") contentType = "image/png";
        else if (ext === "gif") contentType = "image/gif";
        else if (ext === "webp") contentType = "image/webp";
        else if (ext === "svg") contentType = "image/svg+xml";

        // Return raw image buffer with caching headers
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error reading uploaded file:", error);
        return new NextResponse("Error reading file", { status: 500 });
    }
}
