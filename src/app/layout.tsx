import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "VeriNews AI - Decisive Information Verification Engine",
  description: "Verify news claims, detect deepfakes, and combat misinformation in real-time with our multi-vector AI analysis engine. Professional-grade info-integrity dashboard.",
  metadataBase: new URL("https://verinews.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VeriNews AI - Information Integrity Redined",
    description: "Multi-vector AI verification for the modern age. Combat misinformation with decise intelligence.",
    url: "https://verinews.ai",
    siteName: "VeriNews AI",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeriNews AI - Verify with Intelligence",
    description: "Pro-grade fake news detector powered by multi-vector analysis.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
