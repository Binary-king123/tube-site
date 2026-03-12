import { db } from "@/lib/db";
import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ILOVEDESI – Free HD Adult Videos | Watch Online Free",
  description: "ILOVEDESI: Watch the best free HD desi videos. Thousands of Indian, aunty, desi & more. Updated daily.",
  alternates: { canonical: "/" },
};

const PER_PAGE = 20;

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => `/?page=${p}`;
  const delta = 4;
  const start = Math.max(1, page - delta);
  const end = Math.min(totalPages, page + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary hover:text-white transition-colors">
          &laquo; Prev
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={buildHref(1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">1</Link>
          {start > 2 && <span className="px-2 text-gray-500">…</span>}
        </>
      )}
      {pages.map(p => (
        <Link key={p} href={buildHref(p)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${p === page ? "bg-primary text-white" : "bg-white/5 text-gray-300 hover:bg-primary hover:text-white"}`}>
          {p}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}
          <Link href={buildHref(totalPages)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/5 text-gray-300 hover:bg-primary hover:text-white transition-colors">{totalPages}</Link>
        </>
      )}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className="px-3 py-1.5 rounded text-sm font-medium bg-white/10 text-white hover:bg-primary hover:text-white transition-colors">
          Next &raquo;
        </Link>
      )}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page || "1"));

  const [newVideos, totalNew] = await Promise.all([
    db.video.findMany({
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    db.video.count().catch(() => 0),
  ]);

  const totalPages = Math.ceil(totalNew / PER_PAGE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ILOVEDESI",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col bg-[#141414] rounded-xl shadow-lg border border-white/5 p-4 md:p-6 mb-16 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sort Tabs */}
      <div className="flex flex-col gap-2 border-b border-white/10 mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Newest</h1>
        <div className="flex items-center gap-6 mt-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link href="/" className="pb-2 border-b-2 border-primary text-[14px] font-bold text-primary">Newest</Link>
          <Link href="/search?sort=best" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-400 hover:text-white transition-colors">Best</Link>
          <Link href="/search?sort=views" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-400 hover:text-white transition-colors">Most viewed</Link>
          <Link href="/search?sort=duration" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-400 hover:text-white transition-colors">Longest</Link>
          <Link href="/search?sort=random" className="pb-2 border-b-2 border-transparent text-[14px] font-bold text-gray-400 hover:text-white transition-colors">Random</Link>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 border-t border-white/10 pt-5">
        {newVideos.map((video: any) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} />

      {totalNew > 0 && (
        <p className="text-center text-xs text-gray-500 py-4">
          Page {page} of {totalPages} — {totalNew.toLocaleString()} videos total
        </p>
      )}
    </div>
  );
}
