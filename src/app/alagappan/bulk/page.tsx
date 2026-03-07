"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { bulkImportVideos } from "../actions";

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: number; failed?: number; errors?: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null); // Clear previous results
        }
    };

    const handleUpload = async () => {
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

    return (
        <div className="mx-auto max-w-3xl py-10 pb-20">
            <div className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                    <UploadCloud className="h-7 w-7 text-primary" />
                    Bulk Video Uploader
                </h1>
                <p className="text-sm text-gray-400">
                    Upload a CSV file to instantly add hundreds of videos. The CSV must contain the following headers exactly:
                    <span className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded mx-1">title, url, embed, thumbnail, category, tags, duration</span>
                </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#141414] p-8 shadow-xl flex flex-col items-center gap-6">

                {/* Drag & Drop Zone (Simplified) */}
                <div className="w-full relative rounded-xl border-2 border-dashed border-white/20 bg-[#1a1a1a] p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                        title="Upload CSV"
                    />
                    <UploadCloud className="h-10 w-10 text-gray-500" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">{file ? file.name : "Click or drag your CSV file here"}</p>
                        <p className="text-xs text-gray-500 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports .csv files up to 50MB"}</p>
                    </div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/80 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                    {loading ? "Processing CSV..." : "Start Bulk Import"}
                </button>

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

            {/* Guide Section */}
            <div className="mt-12 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
                <h3 className="text-lg font-bold text-white mb-2">Supported Formats</h3>
                <p className="text-sm text-gray-400 mb-4">
                    This uploader automatically detects two types of files:
                </p>
                <div className="space-y-4 text-sm text-gray-300">
                    <div className="rounded-md bg-white/5 border border-white/10 p-4">
                        <strong className="text-primary flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4" /> 1. Auto-Magic Eporner Feed (Pipe Delimited)</strong>
                        <p className="mb-2">If you downloaded a raw data dump from Eporner Webmasters, <strong>you do not need to format it!</strong> Just drag and drop the `.txt` or `.csv` file directly into the box above. The system will auto-map all columns and generate the iframe embeds automatically.</p>
                        <code className="text-xs text-gray-500 bg-black/50 p-2 rounded block break-all">jViZDSoTShc|https://...|3289|Gina Valentina|Outdoor...</code>
                    </div>

                    <div className="rounded-md bg-white/5 border border-white/10 p-4">
                        <strong className="text-white flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4" /> 2. Standard CSV (Comma Separated)</strong>
                        <p className="mb-2">For any other tube network, ensure your file contains these exact headers on the first line:</p>
                        <code className="text-primary text-xs bg-black/50 px-2 py-1 rounded block">title, url, embed, thumbnail, category, tags, duration</code>
                    </div>
                </div>
            </div>

        </div>
    );
}
