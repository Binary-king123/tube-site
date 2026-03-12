import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { Tag, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tags",
    description: "Browse free adult videos by tag. Find exactly what you're looking for.",
    alternates: { canonical: "/tags" },
};

const PER_PAGE = 20;

function Pagination({ page, totalPages, tag }: { page: number; totalPages: number; tag: string }) {
    if (totalPages <= 1) return null;
    const buildHref = (p: number) => `/tags?tag=${encodeURIComponent(tag)}&page=${p}`;
    const delta = 4;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
            {page > 1 && <Link href={buildHref(page - 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary transition-colors">&laquo; Prev</Link>}
            {start > 1 && (<><Link href={buildHref(1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">1</Link>{start > 2 && <span className="px-2 text-gray-500">…</span>}</>)}
            {pages.map(p => (
                <Link key={p} href={buildHref(p)} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${p === page ? "bg-primary text-white" : "bg-white/5 text-gray-300 hover:bg-primary hover:text-white"}`}>{p}</Link>
            ))}
            {end < totalPages && (<>{end < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}<Link href={buildHref(totalPages)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">{totalPages}</Link></>)}
            {page < totalPages && <Link href={buildHref(page + 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary transition-colors">Next &raquo;</Link>}
        </div>
    );
}

export default async function TagsPage({
    searchParams,
}: {
    searchParams?: { tag?: string; page?: string };
}) {
    const selectedTag = searchParams?.tag?.toLowerCase() || "";
    const page = Math.max(1, parseInt(searchParams?.page || "1"));

    // If a tag is selected, show its videos
    if (selectedTag) {
        const [videos, total] = await Promise.all([
            db.video.findMany({
                where: { tags: { has: selectedTag } },
                orderBy: { views: "desc" },
                take: PER_PAGE,
                skip: (page - 1) * PER_PAGE,
            }),
            db.video.count({ where: { tags: { has: selectedTag } } }),
        ]);

        const totalPages = Math.ceil(total / PER_PAGE);

        return (
            <div className="flex flex-col gap-6 pb-12">
                <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                    <Link href="/tags" className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary mb-2">
                        <ArrowLeft className="h-4 w-4" /> All Tags
                    </Link>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Tag className="h-6 w-6 text-primary" />
                        #{selectedTag}
                    </h1>
                    <p className="text-sm text-gray-400">{total.toLocaleString()} videos{totalPages > 1 ? ` — page ${page} of ${totalPages}` : ""}</p>
                </div>

                {videos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {videos.map((video: any) => <VideoCard key={video.id} {...video} />)}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-20">No videos found for this tag.</p>
                )}

                <Pagination page={page} totalPages={totalPages} tag={selectedTag} />
            </div>
        );
    }

    // Default: show all unique tags from video DB using raw SQL
    type TagRow = { tag: string; count: bigint };
    const tagRows = await db.$queryRaw<TagRow[]>`
        SELECT unnest(tags) AS tag, COUNT(*) AS count
        FROM "Video"
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 200
    `;

    const tags = tagRows.map(r => ({ tag: r.tag, count: Number(r.count) }));

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Tag className="h-7 w-7 text-primary" />
                    Browse Tags
                </h1>
                <p className="text-gray-400 text-sm">{tags.length} tags — click any tag to browse its videos.</p>
            </div>

            {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {tags.map(({ tag, count }) => (
                        <Link
                            key={tag}
                            href={`/tags?tag=${encodeURIComponent(tag)}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-150"
                        >
                            <span className="capitalize">{tag}</span>
                            <span className="text-xs opacity-60">({count.toLocaleString()})</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    No tags found. Upload some videos first.
                </div>
            )}
        </div>
    );
}
