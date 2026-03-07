import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    robots: { index: false },
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 pb-20 flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-gray-400 text-sm">Last updated: March 2025</p>

            <section className="flex flex-col gap-3 text-gray-300 text-sm leading-relaxed">
                <h2 className="text-lg font-semibold text-white">1. Age Restriction</h2>
                <p>This website contains adult content. By accessing this site, you confirm that you are 18 years of age or older, and that it is legal to view adult content in your jurisdiction.</p>

                <h2 className="text-lg font-semibold text-white mt-4">2. Content Policy</h2>
                <p>TubeX is an aggregator website. We link to content hosted on third-party platforms. We do not host, store, or distribute any video files directly on our servers. All video players are iframes embedded from their original source sites.</p>

                <h2 className="text-lg font-semibold text-white mt-4">3. DMCA Compliance</h2>
                <p>If you believe that any content linked on this site infringes your copyright, please send a DMCA takedown notice to our contact email. We will remove the link within 24 hours of a valid notice.</p>

                <h2 className="text-lg font-semibold text-white mt-4">4. Disclaimer</h2>
                <p>The site is provided &quot;as is&quot; without warranty of any kind. We are not responsible for any content available on third-party sites accessed via our links.</p>

                <h2 className="text-lg font-semibold text-white mt-4">5. Changes</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
            </section>
        </div>
    );
}
