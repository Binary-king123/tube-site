import { db } from "@/lib/db";
import VideoCard from "@/components/VideoCard";
import { AdSlot } from "@/components/AdSlot";
import { Search as SearchIcon, XCircle } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SearchPageProps {
    searchParams: { q?: string; page?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const query = searchParams.q || "";

    return {
        title: query ? `Search results for "${query}"` : "Search Videos",
        description: `Browse thousands of high quality free adult videos matching "${query}".`,
        robots: {
            index: false, // Prevent search engines from indexing infinite search query permutations
            follow: true,
        }
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams.q || "";
    const page = parseInt(searchParams.page || "1");
    const limit = 24;
    const skip = (page - 1) * limit;

    // Build the fuzzy search query
    const whereClause = query ? {
        OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { category: { contains: query, mode: "insensitive" as const } },
            { tags: { has: query.toLowerCase() } }
        ]
    } : {};

    // Fetch results and total count
    const [videos, total] = await Promise.all([
        db.video.findMany({
            where: whereClause,
            orderBy: { views: "desc" },
            skip,
            take: limit,
        }),
        db.video.count({ where: whereClause })
    ]);

    return (
        <div className="flex flex-col gap-8 pb-12">
            <AdSlot zoneId="search-top-banner" width={728} height={90} className="w-full max-w-[728px] hidden md:flex" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-b border-border pb-6">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
                        <SearchIcon className="h-7 w-7 text-primary" />
                        {query ? `Results for "${query}"` : "Search Videos"}
                    </h1>
                    <p className="text-muted-foreground">
                        Found {total.toLocaleString()} video{total === 1 ? "" : "s"}
                    </p>
                </div>

                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                        {videos.map((video: any) => (
                            <VideoCard key={video.id} {...video} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed border-border rounded-xl bg-muted/20">
                        <XCircle className="h-12 w-12 text-muted-foreground" />
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold">No videos found</h3>
                            <p className="text-muted-foreground max-w-md">
                                We couldn't find any videos matching your search. Try adjusting your keywords or browsing our categories.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Simple Pagination Footer - can be expanded to proper pages later */}
            {total > limit && (
                <div className="flex justify-center mt-10">
                    {/* In a fuller app, add actual page numbers here. Next/Prev for now omitted for brevity. */}
                    <span className="text-sm text-muted-foreground">End of page {page}</span>
                </div>
            )}
        </div>
    );
}
