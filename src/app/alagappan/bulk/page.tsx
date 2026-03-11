"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, Send } from "lucide-react";
import { bulkImportVideos, bulkImportText } from "../actions";

export default function BulkUploadPage() {
    // Shared State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: number; failed?: number; errors?: string[] } | null>(null);

    // CSV State
    const [file, setFile] = useState<File | null>(null);

    // Text State
    const [textLogs, setTextLogs] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null); 
        }
    };

    const handleUploadCSV = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await bulkImportVideos(formData);
            setResult(res);
        } catch (error: any) {
            setResult({ errors: [error?.message || "An unknown error occurred during upload."] });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadText = async () => {
        if (!textLogs) return;
        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("text", textLogs);
            formData.append("category", category);
            formData.append("tags", tags);

            const res = await bulkImportText(formData);
            setResult(res);
            if (res && res.success && res.success > 0) {
                setTextLogs(""); // clear on success
            }
        } catch (error: any) {
            setResult({ errors: [error?.message || "An unknown error occurred during upload."] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl py-10 pb-20">
            <div className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                    <UploadCloud className="h-7 w-7 text-primary" />
                    Advanced Bulk Uploader
                </h1>
                <p className="text-sm text-gray-400">
                    Upload a raw CSV file OR just paste raw Scraper Logs containing MP4 and JPG URLs. Hotlink-protected thumbnails are automatically downloaded.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Text Parser Form */}
                <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl flex flex-col gap-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Raw Scraper Logs</h2>
                    <p className="text-xs text-gray-400 font-medium">Paste the VM59 output containing `.mp4` & `.jpg` URLs. It will auto-match, build titles natively, and download images instantly.</p>
                    
                    <textarea 
                        className="w-full h-40 rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-xs font-mono text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="VM59:53 https://cdn.desibf.com/2026/03/Video.mp4&#10;VM59:54 https://desibf.com/.../Video.jpg"
                        value={textLogs}
                        onChange={(e) => setTextLogs(e.target.value)}
                    ></textarea>
                    
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Default Category</label>
                            <input 
                                type="text" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                className="w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="e.g. Desi" 
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Default Tags</label>
                            <input 
                                type="text" 
                                value={tags} 
                                onChange={(e) => setTags(e.target.value)} 
                                className="w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="bhabhi, sex, hindi" 
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={handleUploadText}
                        disabled={!textLogs || loading}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        {loading ? "Parsing & Downloading..." : "Process Text Logs"}
                    </button>
                </div>

                {/* CSV File Dropzone */}
                <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl flex flex-col gap-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><UploadCloud className="h-5 w-5 text-gray-300" /> Standard CSV Upload</h2>
                    <p className="text-xs text-gray-400 font-medium">Alternatively upload standard CSVs containing rows exactly matching: `title, url, embed, thumbnail, category, tags`</p>
                    
                    <div className="w-full h-40 mt-1 relative rounded-xl border-2 border-dashed border-white/20 bg-[#1a1a1a] p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                            title="Upload CSV"
                        />
                        <UploadCloud className="h-8 w-8 text-gray-500" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-white">{file ? file.name : "Drop your CSV file here"}</p>
                            <p className="text-xs text-gray-500 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .csv files up to 50MB"}</p>
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleUploadCSV}
                        disabled={!file || loading}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                        {loading ? "Processing CSV..." : "Start CSV Import"}
                    </button>
                </div>

            </div>

            {/* Results Section */}
            {result && (
                <div className="mt-8 flex flex-col gap-4">
                    {/* Success Metrics */}
                    {(result.success !== undefined || result.failed !== undefined) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5 flex flex-col gap-1 items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-1" />
                                <span className="text-3xl font-bold text-green-500">{result.success || 0}</span>
                                <span className="text-xs font-semibold uppercase text-green-500/70">Successfully Imported</span>
                            </div>
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 flex flex-col gap-1 items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-500 mb-1" />
                                <span className="text-3xl font-bold text-red-500">{result.failed || 0}</span>
                                <span className="text-xs font-semibold uppercase text-red-500/70">Failed to Import</span>
                            </div>
                        </div>
                    )}

                    {/* Error Log */}
                    {result.errors && result.errors.length > 0 && (
                        <div className="rounded-xl border border-red-500/20 bg-[#1a1010] p-6">
                            <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Error Log ({result.errors.length})
                            </h3>
                            <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 text-xs font-mono text-gray-400">
                                {result.errors.map((err, i) => (
                                    <li key={i} className="border-l-2 border-red-500/40 pl-3 py-1 bg-red-500/5">{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
