import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and strictly allow only images
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeFilename = `${uniqueSuffix}.${ext}`;

        // Define path to public/uploads
        const uploadDir = join(process.cwd(), "public", "uploads");

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, safeFilename);

        // Write the file to disk
        await writeFile(filePath, buffer);

        // Return the final public URL path
        return NextResponse.json({ success: true, url: `/uploads/${safeFilename}` });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
    }
}
