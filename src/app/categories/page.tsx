import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import { Layers, Folder, ChevronRight, PlayCircle } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Categories & Tags",
    description: "Browse the best free porn by category. Discover HD amateur, teens, MILFs, and deeply engaging adult content organized by tags.",
    alternates: {
        canonical: "/categories",
    }
};

export default async function CategoriesPage() {

    // Fetch all predefined categories
    const categories = await db.category.findMany({
        orderBy: { name: "asc" }
    });

    // Fetch count of videos per category (groupBy requires Prisma 5+)
    const categoryCounts = await db.video.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { category: { not: null } }
    });

    // Map counts to the category objects
    const categoriesWithCounts = categories.map((cat: any) => {
        const agg = categoryCounts.find((c: any) => c.category === cat.name);
        return {
            ...cat,
            count: agg?._count.category || 0
        };
    }).sort((a: any, b: any) => b.count - a.count); // Sort by most popular

    return (
        <div className="flex flex-col gap-10 pb-12">
            <AdSlot zoneId="categories-top-banner" width={728} height={90} className="w-full max-w-[728px] hidden md:flex" />

            <section>
                <div className="flex flex-col gap-2 border-b border-border pb-6 mb-8">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
                        <Layers className="h-7 w-7 text-primary" />
                        Browse Categories
                    </h1>
                    <p className="text-muted-foreground">
                        Explore thousands of high-quality clips handpicked into detailed categories.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoriesWithCounts.map((category: any) => (
                        <Link
                            key={category.id}
                            href={`/search?q=${category.slug}`}
                            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 hover:bg-muted/50 transition-all duration-300"
                        >
                            <div className="absolute right-0 top-0 -mr-4 -mt-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Folder className="h-32 w-32" />
                            </div>

                            <div className="relative flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {category.name}
                                    </h3>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <PlayCircle className="h-4 w-4" />
                                    {category.count.toLocaleString()} videos
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {categoriesWithCounts.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                        No categories have been created yet. Add them in the Admin panel.
                    </div>
                )}
            </section>

        </div>
    );
}
