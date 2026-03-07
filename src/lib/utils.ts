import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const paddedM = m.toString().padStart(2, "0");
    const paddedS = s.toString().padStart(2, "0");
    if (h > 0) return `${h}:${paddedM}:${paddedS}`;
    return `${m}:${paddedS}`;
}

export function formatViews(views: number) {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views.toString();
}
