import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import AgeGate from "@/components/AgeGate";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tubex.com"),
  title: {
    default: "ILOVEDESI – Free HD Adult Videos",
    template: "%s | ILOVEDESI",
  },
  description:
    "ILOVEDESI: Watch thousands of free HD adult videos. Indian, aunty, desi, amateur & more. Updated daily.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ILOVEDESI – Free HD Adult Videos",
    description: "Watch thousands of free HD adult videos. Indian, aunty, desi, amateur & more.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tubex.com",
    siteName: "ILOVEDESI",
    images: [
      {
        url: "/og-image.jpg", // Create an og-image.jpg in the public folder eventually
        width: 1200,
        height: 630,
        alt: "ILOVEDESI Preview Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ILOVEDESI – Free HD Adult Videos",
    description: "Watch thousands of free HD adult videos. Indian, aunty, desi, amateur & more.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AgeGate />

        {/* Sticky top navbar */}
        <Navbar />

        {/* Main layout: sidebar + content */}
        <div className="flex w-full max-w-[1700px] mx-auto px-3 md:px-4 xl:px-6 pt-4">
          {/* Sidebar — hidden on mobile, visible on lg+ desktop */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 min-w-0 lg:ml-4 xl:ml-6">
            {children}
          </main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
