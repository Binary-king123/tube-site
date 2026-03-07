"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, FormEvent } from "react";
import { Search, Menu, X, Flame, Home, Grid3X3, Star } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setMobileOpen(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-[1700px] items-center gap-3 px-3 md:px-4 xl:px-6">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 shrink-0 mr-2">
                        <span className="text-xl font-black tracking-tighter text-primary drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                            TUBE
                        </span>
                        <span className="text-xl font-black tracking-tighter text-white">X</span>
                    </Link>

                    {/* Desktop nav links */}
                    <nav className="hidden md:flex items-center gap-1 shrink-0">
                        <Link href="/" className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Home className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/search?sort=popular" className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Flame className="h-4 w-4 text-primary" /> Trending
                        </Link>
                        <Link href="/categories" className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Grid3X3 className="h-4 w-4" /> Categories
                        </Link>
                    </nav>

                    {/* Search bar — grows in the centre */}
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search videos, tags, categories…"
                                className="w-full rounded-full border border-white/10 bg-[#1a1a1a] pl-9 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                        <button type="submit" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80 transition-colors hidden sm:block">
                            Search
                        </button>
                    </form>

                    {/* Premium badge */}
                    <Link href="/" className="hidden xl:flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity shrink-0">
                        <Star className="h-3 w-3 fill-current" /> PREMIUM FREE
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        className="md:hidden ml-auto rounded-md p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile slide-down menu */}
            {mobileOpen && (
                <div className="md:hidden fixed top-14 left-0 right-0 z-40 border-b border-white/10 bg-[#0d0d0d]/98 backdrop-blur-lg px-4 py-4 flex flex-col gap-2 shadow-xl">
                    {[
                        { href: "/", icon: <Home className="h-4 w-4" />, label: "Home" },
                        { href: "/search?sort=popular", icon: <Flame className="h-4 w-4 text-primary" />, label: "Trending" },
                        { href: "/categories", icon: <Grid3X3 className="h-4 w-4" />, label: "Categories" },
                    ].map(l => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            {l.icon} {l.label}
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
