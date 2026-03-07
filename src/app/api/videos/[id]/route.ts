import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const video = await db.video.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(video);
    } catch (error) {
        console.error("Error fetching video:", error);
        return NextResponse.json(
            { error: "Failed to fetch video" },
            { status: 500 }
        );
    }
}

// POST to increment views
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const video = await db.video.update({
            where: { id: params.id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ success: true, views: video.views });
    } catch (error) {
        console.error("Error updating video views:", error);
        return NextResponse.json(
            { error: "Failed to update views" },
            { status: 500 }
        );
    }
}
