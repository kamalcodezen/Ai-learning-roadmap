import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AiPather — AI-Powered Learning Roadmaps for Modern Developers",
  description:
    "Generate tailored learning paths for Python, LLMs, Next.js, Rust, and System Design with milestone tracking and AI guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark antialiased`}>
      <head>
        {/* Flaticon UIcons CDN for Bold-Rounded Icons */}
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css"
        />
      </head>
      <body className="min-h-screen bg-[#050608] text-white flex flex-col selection:bg-[#eb5722] selection:text-white">
        {children}
      </body>
    </html>
  );
}
