"use client";

import React, { useState } from "react";
import VideoCard from "@/components/VideoCard";
import { ChevronDown, Loader2 } from "lucide-react";

interface HomePageClientProps {
    initialVideos: any[];
    totalVideos: number;
    currentPage: number;
    perPage: number;
}

export default function HomePageClient({
    initialVideos,
    totalVideos,
    currentPage,
    perPage,
}: HomePageClientProps) {
    const [videos, setVideos] = useState(initialVideos);
    const [page, setPage] = useState(currentPage);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(videos.length < totalVideos);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        const nextPage = page + 1;
        try {
            const res = await fetch(
                `/api/videos?page=${nextPage}&limit=${perPage}&sort=newest`
            );
            const data = await res.json();
            const newVideos = data.data as any[];
            setVideos((prev) => [...prev, ...newVideos]);
            setPage(nextPage);
            if (videos.length + newVideos.length >= totalVideos) {
                setHasMore(false);
            }
        } catch {
            // silently retry next time
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 border-t border-gray-100 pt-5">
                {videos.map((video, idx) => (
                    <React.Fragment key={video.id}>
                        <VideoCard {...video} />

                        {/* Inject Native 300x250 Ad Block */}
                        {(idx === 2 || idx === 7) && (
                            <div className="hidden sm:flex col-span-1 min-h-[180px] bg-black text-white items-center justify-center font-bold text-3xl rounded-sm shadow-md">
                                300x250
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-primary/60 disabled:opacity-50 transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Load More Videos
                            </>
                        )}
                    </button>
                </div>
            )}

            {!hasMore && videos.length > 0 && (
                <p className="text-center text-xs text-gray-600 py-2">
                    You&apos;ve reached the end — {totalVideos.toLocaleString()} videos total
                </p>
            )}
        </div>
    );
}
