"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
    zoneId: string;
    width: number;
    height: number;
    className?: string;
}

export function AdSlot({ zoneId, width, height, className = "" }: AdSlotProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const loaded = useRef(false);

    useEffect(() => {
        // This simulates loading an ExoClick or TrafficJunky ad script
        // In production, you would inject the actual script tag provided by the ad network here.
        if (!adRef.current || loaded.current) return;
        loaded.current = true;

        // Example for ExoClick:
        // const script = document.createElement("script");
        // script.src = `https://syndication.exoclick.com/ads.js`;
        // script.async = true;
        // adRef.current.appendChild(script);

    }, [zoneId]);

    return (
        <div
            className={`mx-auto flex items-center justify-center bg-muted/30 border border-border/50 text-muted-foreground text-xs overflow-hidden ${className}`}
            style={{ width, height, minHeight: height }}
            ref={adRef}
        >
            {/* Placeholder for Dev Mode */}
            <div className="flex flex-col items-center gap-1 opacity-50">
                <span>Ad Space</span>
                <span>{width}x{height}</span>
                <span className="text-[10px] uppercase">Zone: {zoneId}</span>
            </div>
        </div>
    );
}
