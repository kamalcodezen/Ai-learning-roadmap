import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Providers from "../providers/providers";
import ReactQueryProvider from "../components/providers/ReactQueryProvider";
import SmoothScroll from "../providers/SmoothScroll";
import NextTopLoader from "nextjs-toploader";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: import("next").Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-domain.com"),
  title: {
    default: "AI Pather — AI-Powered Career Learning Platform",
    template: "%s | AI Pather",
  },
  description: "Navigate your tech career with AI-driven skill assessments, learning roadmaps, and interview prep.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AI Pather",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        className="flex flex-col antialiased"
        suppressHydrationWarning
      >
        <NextTopLoader
          color="var(--color-accent)"
          showSpinner={false}
          shadow="0 0 10px var(--color-accent), 0 0 5px var(--color-accent)"
        />
        <SmoothScroll>
          <ReactQueryProvider>
            <Providers>
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