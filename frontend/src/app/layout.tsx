import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Providers from "../providers/providers";
import ReactQueryProvider from "../components/providers/ReactQueryProvider";
import SmoothScroll from "../providers/SmoothScroll";
import NextTopLoader from "nextjs-toploader";
import RouteTouchReset from "../components/providers/RouteTouchReset";
import PageReloadLoader from "../components/providers/PageReloadLoader";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: import("next").Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aipather.vercel.app"),
  title: {
    default: "AI Pather — AI-Powered Career Learning Platform",
    template: "%s | AI Pather",
  },
  description: "Accelerate your career with AI Pather. Personalized learning roadmaps, AI-driven skill assessments, real-world portfolio proof, and mock interviews.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AI Pather",
    title: "AI Pather — AI-Powered Career Learning Platform",
    description: "Accelerate your  career with AI Pather. Personalized learning roadmaps, AI-driven skill assessments, real-world portfolio proof, and mock interviews.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pather — AI-Powered Career Learning Platform",
    description: "Accelerate your career with AI Pather. Personalized learning roadmaps, AI-driven skill assessments, real-world portfolio proof, and mock interviews.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`antialiased ${hindSiliguri.variable}`}
    >
      <body
        className="flex flex-col antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        <NextTopLoader
          color="var(--color-accent)"
          showSpinner={false}
          shadow="0 0 10px var(--color-accent), 0 0 5px var(--color-accent)"
        />
        <RouteTouchReset />
        <SmoothScroll>
          <ReactQueryProvider>
            <Providers>
              <PageReloadLoader />
              <main className="min-h-screen transition-colors duration-300">
                {children}
              </main>
            </Providers>
          </ReactQueryProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}