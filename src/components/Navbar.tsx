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
            <header className="w-full bg-white shadow-sm border-b border-gray-200">
                {/* Top tier: Logo, Search, Auth */}
                <div className="mx-auto flex h-20 max-w-[1700px] items-center justify-between px-3 md:px-4 xl:px-6">
                    {/* Logo (ULTIMATUBE style) */}
                    <Link href="/" className="flex items-center shrink-0">
                        <span className="text-3xl font-black tracking-tighter text-primary">
                            ULTIMA
                        </span>
                        <span className="text-3xl font-black tracking-tighter text-gray-800">
                            TUBE
                        </span>
                    </Link>

                    {/* Search bar - hidden on very small screens, takes up exact middle */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center max-w-xl mx-8">
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full rounded-l-md border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        />
                        <button type="submit" className="shrink-0 flex items-center justify-center rounded-r-md bg-[#e53e3e] px-6 py-2.5 text-white hover:bg-primary/95 transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                    </form>

                    {/* Right side auth buttons - Removed per request */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(o => !o)}
                            className="md:hidden ml-2 rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Bottom tier: Nav Links */}
                <div className="w-full bg-[#333333]">
                    <nav className="mx-auto flex h-[46px] max-w-[1700px] items-center gap-8 px-3 md:px-4 xl:px-6 overflow-x-auto hide-scrollbar">
                        <Link href="/" className="flex items-center gap-2 h-full border-b-[3px] border-primary text-[13px] font-bold text-white tracking-wide shrink-0">
                            <Home className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/categories" className="flex items-center gap-2 h-full border-b-[3px] border-transparent text-[13px] font-bold text-gray-200 hover:text-white transition-colors shrink-0">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                            Categories
                        </Link>
                        <Link href="/tags" className="flex items-center gap-2 h-full border-b-[3px] border-transparent text-[13px] font-bold text-gray-200 hover:text-white transition-colors shrink-0">
                            <Flame className="h-4 w-4" /> Tags
                        </Link>
                        <Link href="/actors" className="flex items-center gap-2 h-full border-b-[3px] border-transparent text-[13px] font-bold text-gray-200 hover:text-white transition-colors shrink-0">
                            <Star className="h-4 w-4" /> Actors
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Mobile search drop-down equivalent */}
            {mobileOpen && (
                <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 flex flex-col gap-4 shadow-md">
                    <form onSubmit={handleSearch} className="flex items-center w-full">
                        <input
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full rounded-l-md border border-gray-300 bg-white pl-3 py-2 text-sm text-gray-800 focus:outline-none"
                        />
                        <button type="submit" className="shrink-0 bg-[#e53e3e] px-4 py-2 rounded-r-md text-white">
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                    <div className="flex flex-col gap-1">
                        <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Home</Link>
                        <Link href="/categories" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Categories</Link>
                        <Link href="/tags" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Tags</Link>
                    </div>
                </div>
            )}
        </>
    );
}
