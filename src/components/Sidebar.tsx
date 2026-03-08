import { db } from "@/lib/db";
import Link from "next/link";
import { Flame, Star, Eye, Clock, Shuffle } from "lucide-react";

export default async function Sidebar() {
    let categories: { name: string; slug: string }[] = [];
    try {
        categories = await db.category.findMany({
            orderBy: { name: "asc" },
            take: 15,
        });
    } catch {
        // DB might be unavailable — fail silently
    }

    return (
        <aside className="hidden lg:flex flex-col gap-8 w-52 xl:w-60 shrink-0 sticky top-[146px] h-[calc(100vh-146px)] overflow-y-auto hide-scrollbar pb-10 pr-6 border-r border-gray-100">

            {/* Quick Sorting Links */}
            <div>
                <ul className="flex flex-col gap-0.5">
                    {[
                        { label: "Newest", href: "/search?sort=newest", icon: <Flame className="h-[14px] w-[14px]" /> },
                        { label: "Best", href: "/search?sort=popular", icon: <Star className="h-[14px] w-[14px]" /> },
                        { label: "Most viewed", href: "/search?sort=views", icon: <Eye className="h-[14px] w-[14px]" /> },
                        { label: "Longest", href: "/search?sort=duration", icon: <Clock className="h-[14px] w-[14px]" /> },
                        { label: "Random", href: "/search?sort=random", icon: <Shuffle className="h-[14px] w-[14px]" /> },
                    ].map(l => (
                        <li key={l.href}>
                            <Link href={l.href} className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-gray-700 hover:text-primary transition-colors hover:bg-gray-50 rounded-md group">
                                <span className="text-gray-400 group-hover:text-primary transition-colors">{l.icon}</span>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Categories */}
            <div>
                <h3 className="mb-3 px-3 text-[15px] font-bold text-gray-900">Categories</h3>
                <ul className="flex flex-col gap-0.5">
                    {categories.map((cat) => (
                        <li key={cat.slug}>
                            <Link
                                href={`/search?q=${encodeURIComponent(cat.slug)}`}
                                className="block px-3 py-1.5 text-[14px] font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                            >
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/categories" className="block mt-2 px-3 py-1.5 text-[13px] font-semibold text-gray-800 hover:text-primary">
                    All categories &rsaquo;
                </Link>
            </div>

            {/* Tags Placeholder */}
            <div>
                <h3 className="mb-3 px-3 text-[15px] font-bold text-gray-900">Tags</h3>
                <ul className="flex flex-col gap-0.5">
                    {["amateur", "anal", "asian", "babe", "babysitter"].map((tag) => (
                        <li key={tag}>
                            <Link href={`/search?q=${tag}`} className="block px-3 py-1.5 text-[14px] font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors capitalize">
                                {tag}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/search" className="block mt-2 px-3 py-1.5 text-[13px] font-semibold text-gray-800 hover:text-primary">
                    All tags &rsaquo;
                </Link>
            </div>

            {/* Mobile-hidden absolute bottom legal links */}
            <div className="mt-8 pt-6 border-t border-gray-150 flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-3 gap-y-1 px-3">
                    {[["Terms", "/terms"], ["Privacy", "/privacy"], ["DMCA", "/dmca"]].map(([label, href]) => (
                        <Link key={href} href={href} className="text-[11px] text-gray-500 hover:text-gray-800">
                            {label}
                        </Link>
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 px-3 pt-2">© {new Date().getFullYear()} TUBE. 18+ Only.</p>
            </div>
        </aside>
    );
}
