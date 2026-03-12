import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { Layers, ChevronRight, PlayCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Categories",
    description: "Browse free adult videos by category. Indian, Desi, Aunty, College Girl, Tamil, Teen and more.",
    alternates: { canonical: "/categories" },
};

const PER_PAGE = 20;

function Pagination({ page, totalPages, category }: { page: number; totalPages: number; category: string }) {
    if (totalPages <= 1) return null;
    const buildHref = (p: number) => `/categories?cat=${encodeURIComponent(category)}&page=${p}`;
    const delta = 4;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
            {page > 1 && (
                <Link href={buildHref(page - 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary transition-colors">&laquo; Prev</Link>
            )}
            {start > 1 && (
                <>
                    <Link href={buildHref(1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">1</Link>
                    {start > 2 && <span className="px-2 text-gray-500">…</span>}
                </>
            )}
            {pages.map(p => (
                <Link key={p} href={buildHref(p)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${p === page ? "bg-primary text-white" : "bg-white/5 text-gray-300 hover:bg-primary hover:text-white"}`}>
                    {p}
                </Link>
            ))}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}
                    <Link href={buildHref(totalPages)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">{totalPages}</Link>
                </>
            )}
            {page < totalPages && (
                <Link href={buildHref(page + 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary transition-colors">Next &raquo;</Link>
            )}
        </div>
    );
}

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams?: { cat?: string; page?: string };
}) {
    const selectedCat = searchParams?.cat || "";
    const page = Math.max(1, parseInt(searchParams?.page || "1"));

    // If a category is selected, show its videos
    if (selectedCat) {
        const [videos, total] = await Promise.all([
            db.video.findMany({
                where: { category: { equals: selectedCat, mode: "insensitive" } },
                orderBy: { views: "desc" },
                take: PER_PAGE,
                skip: (page - 1) * PER_PAGE,
            }),
            db.video.count({
                where: { category: { equals: selectedCat, mode: "insensitive" } },
            }),
        ]);

        const totalPages = Math.ceil(total / PER_PAGE);

        return (
            <div className="flex flex-col gap-6 pb-12">
                <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                    <Link href="/categories" className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary mb-2">
                        <ArrowLeft className="h-4 w-4" /> All Categories
                    </Link>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight capitalize">{selectedCat}</h1>
                    <p className="text-sm text-gray-400">{total.toLocaleString()} videos{totalPages > 1 ? ` — page ${page} of ${totalPages}` : ""}</p>
                </div>

                {videos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {videos.map((video: any) => <VideoCard key={video.id} {...video} />)}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-20">No videos found in this category.</p>
                )}

                <Pagination page={page} totalPages={totalPages} category={selectedCat} />
            </div>
        );
    }

    // Default: show all categories from real video data
    const categoryGroups = await db.video.groupBy({
        by: ["category"],
        where: { category: { not: null } },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
    });

    // Clean up nulls and sort descending by count
    const categories = categoryGroups
        .filter((g: any) => g.category && g.category.trim() !== "")
        .map((g: any) => ({ name: g.category as string, count: g._count.category as number }))
        .sort((a: any, b: any) => b.count - a.count);

    return (
        <div className="flex flex-col gap-10 pb-12">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Layers className="h-7 w-7 text-primary" />
                    Browse Categories
                </h1>
                <p className="text-gray-400 text-sm">
                    {categories.length} categories — explore thousands of high-quality clips.
                </p>
            </div>

            {categories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.name}
                            href={`/categories?cat=${encodeURIComponent(cat.name)}`}
                            className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-primary/40 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white capitalize truncate">{cat.name}</h3>
                                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <PlayCircle className="h-3.5 w-3.5" />
                                {cat.count.toLocaleString()} videos
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    No categories found. Upload some videos first.
                </div>
            )}
        </div>
    );
}
