import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "../providers/providers";
import SmoothScroll from "../providers/SmoothScroll";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = { title: "App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} font-sans antialiased h-full scroll-smooth dark`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        suppressHydrationWarning
      >
        <NextTopLoader
          color="var(--color-accent)"
          showSpinner={false}
          shadow="0 0 10px var(--color-accent), 0 0 5px var(--color-accent)"
        />
        <SmoothScroll>
          <Providers>
            <main className="min-h-screen transition-colors duration-300">
              {children}
            </main>
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
