"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import { authenticateAdmin } from "./actions";

export default function LoginPage() {
    const [user, setUser] = useState("");
    const [pwd, setPwd] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        startTransition(async () => {
            const result = await authenticateAdmin(user, pwd);
            if (result.success) {
                router.push("/alagappan");
                router.refresh();
            } else {
                setError(result.error || "Login failed");
            }
        });
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <form
                onSubmit={handleLogin}
                className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-white/10 bg-[#151515] p-8 shadow-xl"
            >
                <div className="flex flex-col items-center justify-center gap-2 mb-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-sm text-gray-400">Enter your secure credentials to continue</p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400 text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            autoFocus
                            disabled={isPending}
                            className="w-full rounded-md border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={pwd}
                            onChange={e => setPwd(e.target.value)}
                            disabled={isPending}
                            className="w-full rounded-md border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    {isPending ? "Authenticating..." : "Secure Login"}
                </button>
            </form>
        </div>
    );
}
