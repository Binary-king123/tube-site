import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="flex flex-col items-center gap-3">
                <span className="text-8xl font-black text-primary">404</span>
                <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
                <p className="max-w-sm text-sm text-gray-400">
                    The page you are looking for doesn&apos;t exist or the video may have been removed.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/80 transition-colors"
                >
                    <Home className="h-4 w-4" />
                    Back Home
                </Link>
                <Link
                    href="/categories"
                    className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                    <Search className="h-4 w-4" />
                    Browse Videos
                </Link>
            </div>
        </div>
    );
}
