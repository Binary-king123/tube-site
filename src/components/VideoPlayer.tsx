"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
    embedUrl: string;
    thumbnail: string;
    title: string;
}

export function VideoPlayer({ embedUrl, thumbnail, title }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasTriggeredAd, setHasTriggeredAd] = useState(false);

    // This is the Pop-Under Ad Logic
    const handlePlayClick = () => {
        if (!hasTriggeredAd) {
            // 1. Trigger the Pop-Under Ad in a new tab
            const adWindow = window.open("https://pt.exoclick.com/example-ad-link", "_blank");
            if (adWindow) {
                adWindow.blur();
                window.focus(); // Try to keep user on the main video tab
            }
            setHasTriggeredAd(true);

            // 2. You can optionally stop here to force a 2nd click (Pre-Roll imitation)
            // But usually, we just let the video start playing anyway:
            setIsPlaying(true);
        } else {
            setIsPlaying(true);
        }
    };

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-border/50">
            {!isPlaying ? (
                <div
                    onClick={handlePlayClick}
                    className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={thumbnail}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <button
                        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary"
                        aria-label="Play Video"
                    >
                        <Play className="h-10 w-10 ml-1 fill-current" />
                    </button>
                    {!hasTriggeredAd && (
                        <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                            Ad / Click to Play
                        </div>
                    )}
                </div>
            ) : (
                embedUrl.match(/\.(mp4|webm|mkv|m3u8)($|\?)/i) ? (
                    <video
                        src={embedUrl}
                        controls
                        autoPlay
                        className="absolute inset-0 h-full w-full bg-black outline-none"
                    />
                ) : (
                    <iframe
                        src={embedUrl}
                        title={title}
                        allowFullScreen
                        allow="autoplay; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        className="absolute inset-0 h-full w-full border-none bg-black"
                    />
                )
            )}
        </div>
    );
}
