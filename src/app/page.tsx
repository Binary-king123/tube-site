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
    <div className="flex flex-col bg-white rounded-md shadow-sm border border-gray-100 p-4 md:p-6 mb-16 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── ULTIMATUBE TABS ── */}
      <div className="flex flex-col gap-2 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Newest</h1>
        <div className="flex items-center gap-6 mt-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link href="/" className="pb-2 border-b-2 border-primary text-[14px] font-bold text-primary">Newest</Link>
          <Link href="/search?sort=popular" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Best</Link>
          <Link href="/search?sort=views" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Most viewed</Link>
          <Link href="/search?sort=duration" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Longest</Link>
          <Link href="/search?sort=random" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">Random</Link>
        </div>
      </div>

      <HomePageClient
        initialVideos={newVideos}
        totalVideos={totalNew}
        currentPage={page}
        perPage={take}
      />
    </div>
  );
}
