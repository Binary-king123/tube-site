import { ShieldCheck } from "lucide-react";

export const metadata = {
    title: "18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement",
    description: "Legal 2257 statement for the platform.",
};

export default function Page2257() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl text-foreground">
            <div className="mb-8 flex items-center justify-center">
                <ShieldCheck className="h-12 w-12 text-primary" />
            </div>

            <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl text-black">
                18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
            </h1>

            <div className="prose prose-neutral max-w-none text-gray-800 space-y-6">
                <p>
                    <strong>IMPORTANT COMPLIANCE NOTICE:</strong> All records required by law, including 18 U.S.C. 2257,
                    are maintained by the producers of the content listed on this website.
                </p>

                <p>
                    <strong>ILOVEDESI</strong> is an automated search engine and content aggregator. We do not produce,
                    own, or host any of the video content displayed on this website. All video content is hosted on and
                    streamed from heavily moderated third-party video sharing platforms (such as xHamster, Eporner, XVideos, etc.).
                </p>

                <div className="bg-gray-100 p-6 rounded-lg text-sm">
                    <h3 className="text-lg font-bold text-black mb-3">Exemption Statement</h3>
                    <p className="mb-2">
                        Because we are solely an automated service provider and aggregator:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>We are exempt from maintaining records pursuant to 18 U.S.C. § 2257 and 28 C.F.R. § 75.9.</li>
                        <li>We do not control, modify, or produce any original pictorial depictions of actual sexually explicit conduct.</li>
                        <li>All embedded videos are subject to the independent Record-Keeping Compliance procedures of the host site transmitting the video.</li>
                    </ul>
                </div>

                <p>
                    We operate a strict Zero Tolerance policy regarding illegal content. If you believe any content
                    indexed by our automated systems violates the law, please immediately submit a formal complaint
                    via our DMCA page so we can immediately remove the automated indexing link from our platform.
                </p>
            </div>
        </div>
    );
}
