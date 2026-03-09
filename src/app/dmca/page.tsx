import { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "DMCA Notice",
    robots: { index: false },
};

export default function DmcaPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 pb-20 flex flex-col gap-6">
            <h1 className="text-3xl font-bold">DMCA Takedown Notice</h1>
            <p className="text-gray-400 text-sm">We take copyright infringement seriously and will respond within 24 hours.</p>

            <section className="flex flex-col gap-4 text-gray-300 text-sm leading-relaxed">
                <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
                    <h2 className="text-base font-semibold text-white mb-2">About ILOVEDESI</h2>
                    <p>ILOVEDESI is an aggregator. We do not host or store any video files. All videos are embedded via iframe from their original hosting platforms (e.g., XVideos, xHamster). If you believe a specific embedded link infringes your copyright, we will remove the listing from our index upon a valid DMCA request.</p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <h2 className="text-base font-semibold text-white mb-2">To File a DMCA Notice</h2>
                    <p className="mb-3">Your notice must include:</p>
                    <ul className="list-disc list-inside flex flex-col gap-1 text-gray-400">
                        <li>Your full name and contact information</li>
                        <li>The URL on TubeX that links to the infringing content</li>
                        <li>A statement that you own the copyright or are authorized to act on the owner&apos;s behalf</li>
                        <li>A statement, under penalty of perjury, that the information in your notice is accurate</li>
                        <li>Your electronic or physical signature</li>
                    </ul>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414] px-5 py-4">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Send DMCA notices to</p>
                        <p className="text-white font-medium">dmca@ilovedesi.com</p>
                    </div>
                </div>

                <p className="text-xs text-gray-600">
                    We will process valid notices within 24 hours on business days. Abusive or fraudulent DMCA notices may be subject to legal action under 17 U.S.C. § 512(f).
                </p>
            </section>
        </div>
    );
}
