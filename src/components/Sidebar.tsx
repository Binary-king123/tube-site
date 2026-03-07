import { db } from "@/lib/db";
import Link from "next/link";

const staticLinks = [
    { label: "🔥 Trending", href: "/search?sort=popular" },
    { label: "🆕 New Videos", href: "/search?sort=newest" },
    { label: "📁 Categories", href: "/categories" },
];

export default async function Sidebar() {
    let categories: { name: string; slug: string }[] = [];
    try {
        categories = await db.category.findMany({
            orderBy: { name: "asc" },
            take: 30,
        });
    } catch {
        // DB might be unavailable — fail silently
    }

    return (
        <aside className="hidden lg:flex flex-col gap-1 w-52 xl:w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide pb-10 pr-2">

            {/* Quick Nav */}
            <div className="mb-3">
                {staticLinks.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        {l.label}
                    </Link>
                ))}
            </div>

            <div className="border-t border-white/10 pt-3">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    Categories
                </p>
                <div className="flex flex-col gap-0.5">
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/search?q=${encodeURIComponent(cat.slug)}`}
                            className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-colors group"
                        >
                            <span className="group-hover:font-medium transition-all">{cat.name}</span>
                            <svg className="h-3 w-3 text-gray-700 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile-hidden absolute bottom legal links */}
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-1">
                {[["Terms", "/terms"], ["Privacy", "/privacy"], ["DMCA", "/dmca"]].map(([label, href]) => (
                    <Link key={href} href={href} className="text-[11px] text-gray-700 hover:text-gray-500 px-3 py-0.5">
                        {label}
                    </Link>
                ))}
                <p className="text-[10px] text-gray-700 px-3 pt-1">© 2025 TubeX. 18+ Only.</p>
            </div>
        </aside>
    );
}
