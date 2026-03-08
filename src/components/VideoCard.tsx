"use client";

import Link from "next/link";
import { Eye, Play } from "lucide-react";
import { useState, useRef } from "react";
import { formatDuration, formatViews } from "@/lib/utils";

export interface VideoCardProps {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    previewImages?: string[]; // optional array of preview frames for hover animation
    duration?: number | null;
    views: number;
    category?: string | null;
    tags?: string[];
}


export default function VideoCard({ id, title, slug, thumbnail, previewImages, duration, views, category }: VideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const previews = previewImages && previewImages.length > 1 ? previewImages : null;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (previews) {
            intervalRef.current = setInterval(() => {
                setPreviewIdx(prev => (prev + 1) % previews.length);
            }, 600);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setPreviewIdx(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // --- POP-UNDER AD LOGIC ---
    const handleAdClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // This is where you put your ad network's direct link.
        // When the user clicks the video, it opens the ad in a new background tab, 
        // while the current tab seamlessly navigates to the watch page.
        // (Note: Ad networks like ExoClick usually provide a script that does this automatically).
        if (typeof window !== "undefined") {
            const adUrl = "https://example-ad-network.com/?ref=tubex";
            // Uncomment to enable the pop-under:
            // const adWindow = window.open(adUrl, "_blank");
            // if (adWindow) adWindow.blur();
            // window.focus();
        }
    };

    const currentImg = isHovered && previews ? previews[previewIdx] : thumbnail;

    return (
        <Link
            href={`/video/${id}/${slug}`}
            onClick={handleAdClick}
            className="group flex flex-col gap-2 w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Thumbnail container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#222] shadow-md">

                {/* Gradient placeholder */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800" />

                {/* Thumbnail / Preview image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentImg}
                    alt={title}
                    draggable={false}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${isHovered ? "scale-105 brightness-90" : "scale-100"}`}
                    loading="lazy"
                />

                {/* Hover overlay gradient */}
                {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                )}

                {/* Play icon that slides up on hover */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-sm">
                        <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </div>
                </div>

                {/* HD Badge */}
                <div className="absolute top-1.5 left-1.5 rounded bg-[#f90] px-1 py-0.5 text-[10px] font-bold text-black uppercase leading-none">
                    HD
                </div>

                {/* Duration Badge — xHamster style bottom-right */}
                {duration && (
                    <div className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white leading-none">
                        {formatDuration(duration)}
                    </div>
                )}

                {/* Preview strip dots if hovering multi-frame */}
                {isHovered && previews && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                        {previews.map((_, i) => (
                            <div key={i} className={`rounded-full transition-all ${i === previewIdx ? "bg-primary w-3 h-1.5" : "bg-white/50 w-1.5 h-1.5"}`} />
                        ))}
                    </div>
                )}
            </div>

            {/* Info below thumbnail */}
            <div className="flex flex-col gap-0.5 px-0.5 mt-1.5">
                <h3 className="line-clamp-2 text-[14px] font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-3 text-[12px] font-bold mt-1">
                    <span className="flex items-center gap-1.5 text-gray-500">
                        <Eye className="h-4 w-4" />
                        {formatViews(views)}
                    </span>
                    <span className="flex items-center gap-1 text-[#4ade80]">
                        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
                        {Math.floor(Math.random() * (99 - 70 + 1) + 70)}%
                    </span>
                </div>
            </div>
        </Link>
    );
}
