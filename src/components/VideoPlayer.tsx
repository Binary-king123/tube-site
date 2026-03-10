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
    const [showAdOverlay, setShowAdOverlay] = useState(false); // Ad overlay disabled for now

    // Pop-Under Ad Logic with Cooldown
    const handleAdClick = () => {
        // 1. Trigger the Pop-Under Ad in a new tab
        const adWindow = window.open("https://pt.exoclick.com/example-ad-link", "_blank");
        if (adWindow) {
            adWindow.blur();
            window.focus(); // Try to keep user on the main video tab
        }

        // 2. Remove the overlay to allow normal interaction
        setShowAdOverlay(false);

        // 3. Ensure the video starts playing
        if (!isPlaying) {
            setIsPlaying(true);
        }

        // 4. Cool-down timer: Re-enable the Ad Lock after 10 seconds (10,000ms)
        // Extremely aggressive setting based on user request
        setTimeout(() => {
            setShowAdOverlay(true);
        }, 10000);
    };

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-border/50">
            {/* The Actual Video Player */}
            {isPlaying && (
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

            {/* The Initial Thumbnail and Play Button */}
            {!isPlaying && (
                <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={thumbnail}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <button
                        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md group-hover:scale-110 transition-transform"
                        aria-label="Play Video"
                    >
                        <Play className="h-10 w-10 ml-1 fill-current" />
                    </button>
                    {/*
                    <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                        Ad / Click to Play
                    </div>
                    */}
                </div>
            )}

            {/* The Transparent Click-Gate Overlay (Currently Disabled)
            {showAdOverlay && (
                <div
                    onClick={handleAdClick}
                    className="absolute inset-0 z-50 cursor-pointer"
                    title="Click to Play"
                />
            )}
            */}
        </div>
    );
}
