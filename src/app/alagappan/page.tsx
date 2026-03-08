"use client";

import { useRef, useState } from "react";
import { addVideo } from "./actions";
import { ShieldCheck, Upload, Wand2, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [scraping, setScraping] = useState(false);
    const [message, setMessage] = useState("");

    // Form field states for auto-fill
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [duration, setDuration] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [scraped, setScraped] = useState(false);

    const handleAutoScrape = async () => {
        if (!sourceUrl) return;
        setScraping(true);
        setScraped(false);
        setMessage("");
        try {
            const res = await fetch("/api/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: sourceUrl }),
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                setMessage(`❌ ${data.error || "Failed to scrape the URL."}`);
                return;
            }

            if (data.thumbnail) setThumbnail(data.thumbnail);
            if (data.title) setTitle(data.title);
            if (data.slug) setSlug(data.slug);
            if (data.duration) setDuration(String(data.duration));
            setScraped(true);
        } catch {
            setMessage("❌ Could not connect to the scraper API.");
        } finally {
            setScraping(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setMessage("");
        const result = await addVideo(formData);
        if (result.error) {
            setMessage(`❌ Error: ${result.error}`);
        } else {
            setMessage("✅ Video published successfully!");
            formRef.current?.reset();
            setTitle(""); setSlug(""); setThumbnail(""); setDuration(""); setSourceUrl(""); setScraped(false);
        }
        setLoading(false);
    };

    const inputClass = "rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full";
    const labelClass = "text-xs font-semibold text-gray-400 uppercase tracking-wider";

    return (
        <div className="mx-auto max-w-2xl py-10 pb-20">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        Admin — Add Video
                    </h1>
                    <p className="text-sm text-gray-500">Paste any tube site URL to auto-fill title, thumbnail and duration instantly.</p>
                </div>
                <a href="/alagappan/bulk" className="flex items-center justify-center gap-2 rounded-md bg-[#1a1a1a] border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
                    <Upload className="h-4 w-4 text-primary" />
                    Open Bulk Uploader
                </a>
            </div>

            {/* Auto-Scrape Section */}
            <div className="mb-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Wand2 className="h-4 w-4" /> Auto-Fill from URL
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="url"
                            value={sourceUrl}
                            onChange={e => setSourceUrl(e.target.value)}
                            placeholder="https://www.xvideos.com/video12345600/..."
                            className="pl-9 rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAutoScrape}
                        disabled={scraping || !sourceUrl}
                        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/80 disabled:opacity-40 whitespace-nowrap transition-colors"
                    >
                        {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        {scraping ? "Fetching..." : "Auto Fill"}
                    </button>
                </div>
                {scraped && (
                    <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Fields auto-filled! Review and edit if needed.
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl">
                <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className={labelClass}>Video Title *</label>
                        <input type="text" id="title" name="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Desi Bhabhi Hot Scene" className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="slug" className={labelClass}>URL Slug *</label>
                        <input type="text" id="slug" name="slug" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. desi-bhabhi-hot-scene" className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="embedUrl" className={labelClass}>Iframe Embed URL *</label>
                        <input type="url" id="embedUrl" name="embedUrl" required placeholder="https://www.xvideos.com/embedframe/..." className={inputClass} />
                        <p className="text-[11px] text-gray-600">Find this by right-clicking the video player on the source site → &quot;Copy iframe code&quot;</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="thumbnail" className={labelClass}>Thumbnail URL *</label>
                        <input type="url" id="thumbnail" name="thumbnail" required value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="Auto-filled by scraper, or paste manually" className={inputClass} />
                        {thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumbnail} alt="Preview" className="mt-1 h-32 w-full rounded-md object-cover border border-white/10" />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="category" className={labelClass}>Category</label>
                            <input type="text" id="category" name="category" placeholder="e.g. Aunty" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="duration" className={labelClass}>Duration (Seconds)</label>
                            <input type="number" id="duration" name="duration" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Auto-filled or enter manually" className={inputClass} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="tags" className={labelClass}>Tags (Comma separated)</label>
                        <input type="text" id="tags" name="tags" placeholder="e.g. aunty, bhabhi, desi, hindi" className={inputClass} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {loading ? "Publishing..." : "Publish Video"}
                    </button>

                    {message && (
                        <div className={`rounded-md p-3 text-sm font-medium ${message.includes("Error") || message.includes("❌") ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
