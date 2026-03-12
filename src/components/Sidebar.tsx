import { db } from "@/lib/db";
import Link from "next/link";
import { Flame, Star, Eye, Clock, Shuffle } from "lucide-react";

export default async function Sidebar() {
    // Dynamic categories from real video data
    let categories: { name: string }[] = [];
    try {
        const groups = await db.video.groupBy({
            by: ["category"],
            where: { category: { not: null } },
            _count: { category: true },
            orderBy: { _count: { category: "desc" } },
            take: 15,
        });
        categories = groups
            .filter((g: any) => g.category && g.category.trim() !== "")
            .map((g: any) => ({ name: g.category as string }));
    } catch {
        // DB might be unavailable — fail silently
    }

    // Dynamic top tags from real video data
    type TagRow = { tag: string; count: bigint };
    let topTags: string[] = [];
    try {
        const tagRows = await db.$queryRaw<TagRow[]>`
            SELECT unnest(tags) AS tag, COUNT(*) AS count
            FROM "Video"
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 8
        `;
        topTags = tagRows.map((r: TagRow) => r.tag).filter(Boolean);
    } catch {
        // fail silently
    }

    return (
        <aside className="hidden lg:flex flex-col gap-8 w-52 xl:w-60 shrink-0 sticky top-[146px] h-[calc(100vh-146px)] overflow-y-auto hide-scrollbar pb-10 pr-6 border-r border-white/10">

            {/* Quick Sorting Links */}
            <div>
                <ul className="flex flex-col gap-0.5">
                    {[
                        { label: "Newest",      href: "/",                    icon: <Flame className="h-[14px] w-[14px]" /> },
                        { label: "Best",        href: "/search?sort=best",    icon: <Star  className="h-[14px] w-[14px]" /> },
                        { label: "Most viewed", href: "/search?sort=views",   icon: <Eye   className="h-[14px] w-[14px]" /> },
                        { label: "Longest",     href: "/search?sort=duration",icon: <Clock className="h-[14px] w-[14px]" /> },
                        { label: "Random",      href: "/search?sort=random",  icon: <Shuffle className="h-[14px] w-[14px]" /> },
                    ].map(l => (
                        <li key={l.href}>
                            <Link href={l.href} className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-gray-300 hover:text-primary transition-colors hover:bg-white/5 rounded-md group">
                                <span className="text-gray-500 group-hover:text-primary transition-colors">{l.icon}</span>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Dynamic Categories from DB */}
            <div>
                <h3 className="mb-3 px-3 text-[15px] font-bold text-white">Categories</h3>
                <ul className="flex flex-col gap-0.5">
                    {categories.map((cat) => (
                        <li key={cat.name}>
                            <Link
                                href={`/categories?cat=${encodeURIComponent(cat.name)}`}
                                className="block px-3 py-1.5 text-[14px] font-medium text-gray-400 hover:text-primary hover:bg-white/5 rounded-md transition-colors capitalize"
                            >
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/categories" className="block mt-2 px-3 py-1.5 text-[13px] font-semibold text-gray-300 hover:text-primary">
                    All categories &rsaquo;
                </Link>
            </div>

            {/* Dynamic Tags from DB */}
            <div>
                <h3 className="mb-3 px-3 text-[15px] font-bold text-white">Tags</h3>
                <ul className="flex flex-col gap-0.5">
                    {topTags.map((tag) => (
                        <li key={tag}>
                            <Link href={`/tags?tag=${encodeURIComponent(tag)}`} className="block px-3 py-1.5 text-[14px] font-medium text-gray-400 hover:text-primary hover:bg-white/5 rounded-md transition-colors capitalize">
                                {tag}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/tags" className="block mt-2 px-3 py-1.5 text-[13px] font-semibold text-gray-300 hover:text-primary">
                    All tags &rsaquo;
                </Link>
            </div>

            {/* Legal Links */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-3 gap-y-1 px-3">
                    {[["Terms", "/terms"], ["Privacy", "/privacy"], ["DMCA", "/dmca"], ["2257", "/2257"]].map(([label, href]) => (
                        <Link key={href} href={href} className="text-[11px] text-gray-500 hover:text-gray-300">{label}</Link>
                    ))}
                </div>
                <p className="text-[10px] text-gray-500 px-3 pt-2">© {new Date().getFullYear()} ILOVEDESI. 18+ Only. All models 18+.</p>
            </div>
        </aside>
    );
}
