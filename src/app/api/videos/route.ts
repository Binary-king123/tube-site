import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        const sort = searchParams.get("sort") || "newest";
        const category = searchParams.get("category");
        const query = searchParams.get("q");

        const skip = (page - 1) * limit;

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (category) {
            where.category = { equals: category, mode: "insensitive" };
        }

        if (query) {
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { tags: { has: query.toLowerCase() } }
            ];
        }

        // Handle random separately — requires raw SQL
        if (sort === "random") {
            const total = await db.video.count({ where });
            // Use $queryRaw for random ordering (PostgreSQL)
            const videos = await db.$queryRaw`
                SELECT * FROM "Video"
                ORDER BY RANDOM()
                LIMIT ${limit} OFFSET ${skip}
            `;
            return NextResponse.json({
                data: videos,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            });
        }

        // Build orderBy for non-random sorts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let orderBy: any = { createdAt: "desc" }; // default: newest

        if (sort === "popular" || sort === "best") {
            orderBy = { views: "desc" };
        } else if (sort === "views") {
            orderBy = { views: "desc" };
        } else if (sort === "duration") {
            orderBy = { duration: "desc" };
        } else if (sort === "newest") {
            orderBy = { createdAt: "desc" };
        }

        const [videos, total] = await Promise.all([
            db.video.findMany({ where, orderBy, skip, take: limit }),
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
