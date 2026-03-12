import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { VideoPlayer } from "@/components/VideoPlayer";
import VideoCard from "@/components/VideoCard";
import { formatViews, formatDuration } from "@/lib/utils";
import { AdSlot } from "@/components/AdSlot";
import { Eye, Clock, CalendarDays, Tags, Tag } from "lucide-react";
import Link from "next/link";
import { getDeterministicKeywords } from "@/constants/seo-keywords";

// Native relative time — no date-fns dependency
function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (seconds < 60) return rtf.format(-seconds, "second");
    if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
    if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), "day");
    if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), "month");
    return rtf.format(-Math.floor(seconds / 31536000), "year");
}

interface Props {
    params: { id: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const video = await db.video.findUnique({ where: { id: params.id } });
    if (!video) return { title: "Video Not Found" };

    const tagKeywords = video.tags?.join(", ") || "";
    const descSuffix = video.category ? ` More free ${video.category} videos on TubeX.` : "";

    return {
        title: `${video.title} – Watch Free HD Porn`,
        description: `Watch ${video.title} online for free in HD.${descSuffix} Tags: ${tagKeywords}`,
        keywords: video.tags || [],
        alternates: {
            canonical: `/video/${video.id}/${video.slug}`,
        },
        openGraph: {
            title: video.title,
            description: `Watch ${video.title} online for free in HD.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}/video/${video.id}/${video.slug}`,
            siteName: "ILOVEDESI",
            images: [
                {
                    url: video.thumbnail,
                    width: 1280,
                    height: 720,
                    alt: `Watch ${video.title} - HD Thumbnail`,
                },
            ],
            type: "video.other",
            videos: [
                {
                    url: video.embedUrl,
                    width: 1280,
                    height: 720,
                    type: "text/html",
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: video.title,
            description: `Watch ${video.title} online for free in HD.`,
            images: [video.thumbnail],
        },
    };
}

export default async function WatchPage({ params }: Props) {
    const video = await db.video.findUnique({ where: { id: params.id } });
    if (!video) return notFound();

    // Fire-and-forget view increment
    db.video.update({
        where: { id: video.id },
        data: { views: { increment: 1 } },
    }).catch(console.error);

    // Tag-based recommendations — prioritise same category, then fall back to same tags
    const relatedByCategory = video.category
        ? await db.video.findMany({
            where: { category: video.category, id: { not: video.id } },
            take: 12,
            orderBy: { views: "desc" },
        })
        : [];

    // Per-tag recommendation row (first 2 tags)
    const tagRows: { tag: string; videos: any[] }[] = [];
    if (video.tags && video.tags.length > 0) {
        for (const tag of video.tags.slice(0, 2)) {
            const vids = await db.video.findMany({
                where: { tags: { has: tag }, id: { not: video.id } },
                take: 6,
                orderBy: { views: "desc" },
            });
            if (vids.length > 0) tagRows.push({ tag, videos: vids });
        }
    }

    // Deterministic SEO keywords for this specific video
    const seoKeywords = getDeterministicKeywords(video.id, 100);

    // JSON-LD structured data with advanced SEO (VideoObject + Breadcrumb)
    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: video.title,
            description: `Watch ${video.title} on TubeX.`,
            thumbnailUrl: video.thumbnail.startsWith("http") ? video.thumbnail : `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}${video.thumbnail}`,
            uploadDate: video.createdAt.toISOString().split('T')[0],
            contentUrl: video.embedUrl.startsWith("http") ? video.embedUrl : `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}${video.embedUrl}`,
            duration: video.duration
                ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`
                : undefined,
            interactionStatistic: {
                "@type": "InteractionCounter",
                interactionType: { "@type": "WatchAction" },
                userInteractionCount: video.views,
            },
            keywords: seoKeywords.join(", "),
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": video.category || "Videos",
                    "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}/search?q=${encodeURIComponent(video.category || "videos")}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": video.title,
                    "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}/video/${video.id}/${video.slug}`
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-6 pb-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ── LEFT: Main Player Column ── */}
            <div className="flex-1 min-w-0">
                {/* Player */}
                <VideoPlayer embedUrl={video.embedUrl} thumbnail={video.thumbnail} title={video.title} />

                {/* Video Info */}
                <div className="mt-4 flex flex-col gap-3">
                    <h1 className="text-xl font-bold leading-snug text-white md:text-2xl">
                        {video.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-white/10 pb-4">
                        <span className="flex items-center gap-1.5 text-white font-semibold">
                            <Eye className="h-4 w-4 text-gray-500" />{formatViews(video.views)} views
                        </span>
                        {video.duration && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />{formatDuration(video.duration)}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {timeAgo(new Date(video.createdAt))}
                        </span>
                        {video.category && (
                            <Link
                                href={`/search?q=${encodeURIComponent(video.category)}`}
                                className="ml-auto rounded-full bg-primary/20 border border-primary/40 px-3 py-0.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                {video.category}
                            </Link>
                        )}
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <Tags className="h-4 w-4 text-gray-600 shrink-0" />
                            {video.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/search?q=${encodeURIComponent(tag)}`}
                                    className="rounded-full bg-[#1e1e1e] border border-white/10 px-3 py-1 text-xs font-medium text-gray-400 hover:border-primary/50 hover:text-primary transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── RECOMMENDATION ROWS under the player ── */}
                {relatedByCategory.length > 0 && (
                    <section className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-base font-bold text-white">
                                <Tag className="h-4 w-4 text-primary" />
                                More {video.category} Videos
                            </h2>
                            <Link href={`/search?q=${encodeURIComponent(video.category || "")}`} className="text-xs text-primary hover:underline">
                                See all →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                            {relatedByCategory.map((v: any) => (
                                <VideoCard key={v.id} {...v} />
                            ))}
                        </div>
                    </section>
                )}

                {tagRows.map((row) => (
                    <section key={row.tag} className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-base font-bold text-white">
                                <Tag className="h-4 w-4 text-gray-500" />
                                More #{row.tag}
                            </h2>
                            <Link href={`/search?q=${encodeURIComponent(row.tag)}`} className="text-xs text-primary hover:underline">
                                See all →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                            {row.videos.map((v: any) => (
                                <VideoCard key={v.id} {...v} />
                            ))}
                        </div>
                    </section>
                ))}

                {/* Massive SEO Keyword Block */}
                <div className="mt-12 border-t border-white/5 pt-8 pb-16">
                    <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-4">Related Search Keywords</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-30 hover:opacity-100 transition-opacity">
                        {seoKeywords.map((kw, i) => (
                            <Link 
                                key={i} 
                                href={`/search?q=${encodeURIComponent(kw)}`}
                                className="text-[11px] text-gray-500 hover:text-primary transition-colors cursor-default"
                            >
                                {kw}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Compact Sidebar ── */}
            <div className="w-full xl:w-72 shrink-0 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Up Next</h3>
                <div className="flex flex-col gap-3">
                    {relatedByCategory.slice(0, 8).map((v: any) => (
                        <Link key={v.id} href={`/video/${v.id}/${v.slug}`} className="group flex gap-3 items-start">
                            <div className="relative w-36 aspect-video shrink-0 overflow-hidden rounded-md bg-[#222]">
                                <img
                                    src={v.thumbnail}
                                    alt={v.title}
                                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {v.duration && (
                                    <div className="absolute bottom-1 right-1 rounded bg-black/85 px-1 text-[10px] font-semibold text-white">
                                        {formatDuration(v.duration)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 py-0.5">
                                <h4 className="text-xs font-medium text-gray-200 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                    {v.title}
                                </h4>
                                <span className="text-[11px] text-gray-600 flex items-center gap-1 mt-1">
                                    <Eye className="h-3 w-3" />{formatViews(v.views)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
