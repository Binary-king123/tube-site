"use client";

import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function AgeGate() {
    const [showGate, setShowGate] = useState(false);

    useEffect(() => {
        // Check local storage to see if they already verified their age
        const verified = localStorage.getItem("age-verified");
        if (!verified) {
            // Prevent scrolling while the gate is visible
            document.body.style.overflow = "hidden";
            setShowGate(true);
        }
    }, []);

    const handleEnter = () => {
        localStorage.setItem("age-verified", "true");
        document.body.style.overflow = "auto";
        setShowGate(false);
    };

    const handleExit = () => {
        window.location.href = "https://www.google.com";
    };

    if (!showGate) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex w-[90%] max-w-md flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#111] p-8 text-center shadow-2xl">
                <ShieldAlert className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Age Verification</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        This website contains adult material. You must be 18 years of age or older to enter. By clicking &quot;Enter&quot;, you confirm that you are of legal age in your jurisdiction and consent to viewing sexually explicit content.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 mt-2">
                    <button
                        onClick={handleEnter}
                        className="w-full rounded-md bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-primary/90"
                    >
                        I am 18 or older — Enter
                    </button>

                    <button
                        onClick={handleExit}
                        className="w-full rounded-md border border-white/10 bg-transparent py-3 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        Exit Website
                    </button>
                </div>

                <p className="text-[10px] text-gray-600 mt-2">
                    By entering, you also agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
