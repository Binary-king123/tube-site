import { db } from "@/lib/db";
import VideoCard from "@/components/VideoCard";
import { AdSlot } from "@/components/AdSlot";
import { Flame, Clock, TrendingUp, Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

// Force server-side rendering on every request — needed for DB queries
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TubeX – Free HD Adult Videos | Watch Online Free",
  description: "TubeX: Watch the best free HD porn videos. Thousands of amateur, Indian, aunty, teen & more. Updated daily. Stream instantly, no ads on player.",
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = parseInt(searchParams?.page || "1");
  const take = 24;

  // 1. Trending (most views)
  const trendingVideos = await db.video.findMany({
    take: 12,
    orderBy: { views: "desc" },
  }).catch(() => []);

  // 2. Fresh uploads
  const newVideos = await db.video.findMany({
    take: take,
    skip: (page - 1) * take,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const totalNew = await db.video.count().catch(() => 0);

  // 3. Tag-based recommendation rows (like xHamster's category sections)
  let categoryRows: { category: string; count: number; videos: any[] }[] = [];
  try {
    const categoryGroups = await db.video.groupBy({
      by: ["category"],
      where: { category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 6,
    });

    categoryRows = await Promise.all(
      categoryGroups.map(async (group: any) => {
        const videos = await db.video.findMany({
          where: { category: group.category },
          take: 6,
          orderBy: { views: "desc" },
        });
        return { category: group.category as string, count: group._count.category as number, videos };
      })
    );
  } catch (e) {
    console.error("Category groupBy failed:", e);
    // Fail silently — page still renders without category rows
    categoryRows = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TubeX",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tubex.com",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL || "https://tubex.com"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner Ad */}
      <AdSlot zoneId="top-home-banner" width={728} height={90} className="w-full max-w-[728px] hidden md:flex mx-auto" />

      {/* ── TRENDING ROW ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Flame className="h-5 w-5 text-primary" />
            Trending Now
          </h2>
          <Link href="/search?sort=popular" className="text-xs text-primary hover:underline font-medium">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {trendingVideos.map((video: any) => (
            <VideoCard key={`t-${video.id}`} {...video} />
          ))}
        </div>
      </section>

      {/* ── CATEGORY RECOMMENDATION ROWS (xHamster style) ── */}
      {categoryRows.map((row, i) => (
        <section key={row.category}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Tag className="h-4 w-4 text-primary" />
              {row.category}
              <span className="text-xs font-normal text-gray-500 ml-1">{row.count.toLocaleString()} videos</span>
            </h2>
            <Link href={`/search?q=${encodeURIComponent(row.category)}`} className="text-xs text-primary hover:underline font-medium">
              More {row.category} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {row.videos.map((video: any) => (
              <VideoCard key={`cat-${video.id}-${i}`} {...video} />
            ))}
          </div>
          {/* Inject mid-page ad every 2 rows */}
          {i === 1 && (
            <AdSlot zoneId={`mid-cat-ad-${i}`} width={728} height={90} className="w-full max-w-[728px] mx-auto mt-6 hidden md:flex" />
          )}
        </section>
      ))}

      {/* ── FRESH UPLOADS with Load More ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock className="h-5 w-5 text-gray-400" />
            Latest Videos
            <span className="text-xs font-normal text-gray-500 ml-1">{totalNew.toLocaleString()} total</span>
          </h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(totalNew / take)}</span>
          </div>
        </div>

        <HomePageClient
          initialVideos={newVideos}
          totalVideos={totalNew}
          currentPage={page}
          perPage={take}
        />
      </section>

    </div>
  );
}
