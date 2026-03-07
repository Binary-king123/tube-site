import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    robots: { index: false },
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 pb-20 flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: March 2025</p>

            <section className="flex flex-col gap-3 text-gray-300 text-sm leading-relaxed">
                <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
                <p>We do not require registration or collect personal information. We may use anonymous analytics (e.g., page view counts) to improve site performance.</p>

                <h2 className="text-lg font-semibold text-white mt-4">2. Cookies</h2>
                <p>This site may use cookies to improve user experience (e.g., remembering preferences). Third-party advertising networks (ExoClick, TrafficJunky) may also set cookies on your browser.</p>

                <h2 className="text-lg font-semibold text-white mt-4">3. Third-Party Content</h2>
                <p>Videos are served via iframes from third-party sites. Those sites have their own privacy policies and may collect data independently of us.</p>

                <h2 className="text-lg font-semibold text-white mt-4">4. Advertising</h2>
                <p>We use third-party ad networks. These networks may use your browsing data to show targeted advertisements. You can opt out via your browser settings or ad-opt-out platforms.</p>

                <h2 className="text-lg font-semibold text-white mt-4">5. Contact</h2>
                <p>For privacy-related questions, please contact us via our support page.</p>
            </section>
        </div>
    );
}
