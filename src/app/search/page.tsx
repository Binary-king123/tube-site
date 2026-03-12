import { db } from "@/lib/db";
import VideoCard from "@/components/VideoCard";
import { Search as SearchIcon, XCircle } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchPageProps {
    searchParams: { q?: string; page?: string; sort?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const query = searchParams.q || "";
    const sort = searchParams.sort || "";
    const label = sort === "popular" || sort === "best" ? "Best"
        : sort === "views" ? "Most Viewed"
        : sort === "duration" ? "Longest"
        : sort === "random" ? "Random"
        : query ? `Results for "${query}"` : "Newest";

    return {
        title: query ? `Search: "${query}"` : `${label} Videos`,
        description: `Browse thousands of high quality free adult videos. ${query ? `Matching "${query}".` : ""}`,
        robots: { index: false, follow: true },
    };
}

const PER_PAGE = 20;

const SORT_TABS = [
    { label: "Newest",     sort: "newest" },
    { label: "Best",       sort: "best" },
    { label: "Most Viewed",sort: "views" },
    { label: "Longest",    sort: "duration" },
    { label: "Random",     sort: "random" },
];

function Pagination({ page, totalPages, query, sort }: {
    page: number; totalPages: number; query: string; sort: string;
}) {
    if (totalPages <= 1) return null;

    const buildHref = (p: number) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (sort) params.set("sort", sort);
        params.set("page", String(p));
        return `/search?${params.toString()}`;
    };

    // W3Schools-style: show up to 10 page numbers around current page
    const delta = 4;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
            {/* Prev */}
            {page > 1 && (
                <Link href={buildHref(page - 1)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary hover:text-white transition-colors">
                    &laquo; Prev
                </Link>
            )}

            {/* First page if gap */}
            {start > 1 && (
                <>
                    <Link href={buildHref(1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">1</Link>
                    {start > 2 && <span className="px-2 text-gray-500">…</span>}
                </>
            )}

            {/* Page numbers */}
            {pages.map(p => (
                <Link key={p} href={buildHref(p)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        p === page
                            ? "bg-primary text-white"
                            : "bg-white/5 text-gray-300 hover:bg-primary hover:text-white"
                    }`}>
                    {p}
                </Link>
            ))}

            {/* Last page if gap */}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}
                    <Link href={buildHref(totalPages)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">{totalPages}</Link>
                </>
            )}

            {/* Next */}
            {page < totalPages && (
                <Link href={buildHref(page + 1)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary hover:text-white transition-colors">
                    Next &raquo;
                </Link>
            )}
        </div>
    );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q || "";
    const sort = searchParams.sort || "newest";
    const page = Math.max(1, parseInt(searchParams.page || "1"));
    const skip = (page - 1) * PER_PAGE;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = query ? {
        OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { category: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query.toLowerCase() } }
        ]
    } : {};

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    let videos: any[] = [];
    let total = 0;

    if (sort === "random") {
        // Random order via raw SQL
        total = await db.video.count({ where: whereClause });
        videos = await db.$queryRaw`
            SELECT * FROM "Video"
            ORDER BY RANDOM()
            LIMIT ${PER_PAGE} OFFSET ${skip}
        ` as any[];
    } else {
        if (sort === "popular" || sort === "best") orderBy = { views: "desc" };
        else if (sort === "views") orderBy = { views: "desc" };
        else if (sort === "duration") orderBy = { duration: "desc" };
        else orderBy = { createdAt: "desc" };

        [videos, total] = await Promise.all([
            db.video.findMany({ where: whereClause, orderBy, skip, take: PER_PAGE }),
            db.video.count({ where: whereClause }),
        ]);
    }

    const totalPages = Math.ceil(total / PER_PAGE);

    const activeLabel = SORT_TABS.find(t => t.sort === sort)?.label || "Newest";

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <SearchIcon className="h-6 w-6 text-primary" />
                    {query ? `Results for "${query}"` : activeLabel}
                </h1>
                <p className="text-sm text-gray-400">
                    {total.toLocaleString()} video{total !== 1 ? "s" : ""} found
                    {total > 0 && totalPages > 1 && ` — page ${page} of ${totalPages}`}
                </p>

                {/* Sort Tabs (only when not a keyword search) */}
                {!query && (
                    <div className="flex items-center gap-4 mt-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                        {SORT_TABS.map(tab => {
                            const href = `/search?sort=${tab.sort}`;
                            const active = sort === tab.sort;
                            return (
                                <Link key={tab.sort} href={href}
                                    className={`pb-1.5 border-b-2 text-[14px] font-bold transition-colors ${
                                        active
                                            ? "border-primary text-primary"
                                            : "border-transparent text-gray-400 hover:text-white"
                                    }`}>
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Grid */}
            {videos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {videos.map((video: any) => (
                        <VideoCard key={video.id} {...video} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <XCircle className="h-12 w-12 text-gray-500" />
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-bold text-white">No videos found</h3>
                        <p className="text-gray-400 max-w-md">
                            We couldn&apos;t find any videos {query ? `matching "${query}"` : ""}. Try a different search or browse our categories.
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} query={query} sort={sort} />
        </div>
    );
}
