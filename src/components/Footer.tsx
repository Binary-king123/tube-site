import { db } from "@/lib/db";
import Link from "next/link";

export async function Footer() {
    // Fetch top 50 categories for SEO
    let categories: string[] = [];
    try {
        const catGroups = await db.video.groupBy({
            by: ["category"],
            where: { category: { not: null } },
            _count: { category: true },
            orderBy: { _count: { category: "desc" } },
            take: 50,
        });
        categories = catGroups
            .map((g: any) => g.category as string)
            .filter((c) => c && c.trim() !== "");
    } catch {
        // fail silently
    }

    // Fetch top 200 tags for massive SEO cloud
    type TagRow = { tag: string };
    let tags: string[] = [];
    try {
        const tagRows = await db.$queryRaw<TagRow[]>`
            SELECT unnest(tags) AS tag, COUNT(*) AS count
            FROM "Video"
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 200
        `;
        tags = tagRows.map((r: TagRow) => r.tag).filter(Boolean);
    } catch {
        // fail silently
    }

    // Combine and deduplicate
    const allKeywords = Array.from(new Set([...categories, ...tags]));

    return (
        <footer className="border-t border-border bg-background py-10 mt-10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 border-b border-border pb-10">

                    <div className="flex flex-col gap-4">
                        <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            ILOVEDESI
                        </span>
                        <p className="text-sm text-muted-foreground">
                            The premium aggregator for high quality adult content. Fast, free, and beautiful.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Content</h4>
                        <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link>
                        <Link href="/tags" className="text-muted-foreground hover:text-primary transition-colors">Tags</Link>
                        <Link href="/search?sort=newest" className="text-muted-foreground hover:text-primary transition-colors">New Videos</Link>
                        <Link href="/latest" className="text-muted-foreground hover:text-primary transition-colors">Latest Archive</Link>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Legal</h4>
                        <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/2257" className="text-muted-foreground hover:text-foreground transition-colors">18 U.S.C. 2257</Link>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Contact</h4>
                        <Link href="/dmca" className="text-muted-foreground hover:text-primary transition-colors">DMCA Notice</Link>
                    </div>

                </div>

                {/* MASSIVE SEO KEYWORD BLOCK */}
                {allKeywords.length > 0 && (
                    <div className="py-8">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                            Popular Searches & Categories
                        </h4>
                        <div className="flex flex-wrap gap-x-2 gap-y-1.5 leading-snug">
                            {allKeywords.map((kw, i) => (
                                <Link 
                                    key={`${kw}-${i}`} 
                                    href={`/search?q=${encodeURIComponent(kw)}`}
                                    className="text-[11px] text-muted-foreground/60 hover:text-primary hover:underline lowercase whitespace-nowrap"
                                    title={`Watch free ${kw} porn videos`}
                                >
                                    {kw}{i < allKeywords.length - 1 ? "," : ""}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-6 text-center text-[10px] sm:text-xs text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} ILOVEDESI. All rights reserved.
                        All models appearing on this website were 18 years or older at the time of depiction.
                    </p>
                </div>
            </div>
        </footer>
    );
}
