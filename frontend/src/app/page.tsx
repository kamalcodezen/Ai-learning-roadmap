"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import BannerSection from "@/src/components/BannerSection";
import BrandPartners from "@/src/components/BrandPartners";
import DiagonalMarqueeSection from "@/src/components/DiagonalMarqueeSection";
import Footer from "@/src/components/Footer";
import SiteLoader from "@/src/components/SiteLoader";

export default function Home() {
  const [isLoaderActive, setIsLoaderActive] = useState(true);

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col selection:bg-[#eb5722] selection:text-white relative">
      {/* ── Fixed Floating Navbar ── */}
      <Navbar />

      {/* ── Main Homepage Content ── */}
      <main className="flex-1">
        {/* Section 1: Main Banner & Endless 3D Concave Carousel */}
        <section id="banner" className="w-full relative">
          <BannerSection />
        </section>

        {/* Section 2: Unified 95% Container for BrandPartners & Diagonal Marquee Stream */}
        <section
          id="roadmaps"
          className="w-full flex justify-center px-0 sm:px-6 my-12 sm:my-20 mb-28 sm:mb-40"
        >
          <div className="w-[95%] mx-auto rounded-[30px] overflow-hidden border border-white/5 bg-[#07080c] shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative">
            <BrandPartners />
            <DiagonalMarqueeSection />
          </div>
        </section>
      </main>

      {/* ── Cinematic Footer Section (Includes integrated Magnetic Scroll-To-Top button) ── */}
      <div className="mt-20 sm:mt-32 w-full">
        <Footer />
      </div>

      {/* ── Minimalist Single-Line Stinger Site Loader ── */}
      {isLoaderActive && (
        <SiteLoader onComplete={() => setIsLoaderActive(false)} />
      )}
    </div>
  );
}
