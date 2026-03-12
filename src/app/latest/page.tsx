import { db } from "@/lib/db";
import Link from "next/link";
import { formatViews, formatDuration } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LatestVideosPage() {
    // Fetch top 500 latest videos for the HTML sitemap
    const videos = await db.video.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            views: true,
            duration: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 500,
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-2">Latest Videos Archive</h1>
            <p className="text-gray-400 mb-8">
                Browse our chronological directory of the newest high-definition video uploads.
            </p>

            <div className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
                <ul className="divide-y divide-white/5">
                    {videos.map((v) => (
                        <li key={v.id} className="p-4 hover:bg-white/5 transition-colors">
                            <Link 
                                href={`/video/${v.id}/${v.slug}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <span className="text-primary hover:underline font-medium text-sm md:text-base line-clamp-1">
                                    {v.title}
                                </span>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                                    {v.duration && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDuration(v.duration)}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {formatViews(v.views)}
                                    </span>
                                    <span className="hidden sm:inline-block w-24 text-right">
                                        {new Date(v.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
