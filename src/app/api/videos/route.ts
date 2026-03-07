import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "24");
        const page = parseInt(searchParams.get("page") || "1");
        const sort = searchParams.get("sort") || "newest"; // "newest", "popular"
        const category = searchParams.get("category");
        const query = searchParams.get("q");

        const skip = (page - 1) * limit;

        // Build the query where clause dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (category) {
            where.category = category;
        }

        if (query) {
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { tags: { has: query.toLowerCase() } }
            ];
        }

        // Build the order by clause dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderBy: any = {};
        if (sort === "popular") {
            orderBy.views = "desc";
        } else {
            // Default to newest
            orderBy.createdAt = "desc";
        }

        const [videos, total] = await Promise.all([
            db.video.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            db.video.count({ where }),
        ]);

        return NextResponse.json({
            data: videos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching videos:", error);
        return NextResponse.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        );
    }
}
