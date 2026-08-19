"use client";

import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import CurvedCarousel from "./CurvedCarousel";
import { slides } from "./data";
import { GridPattern } from "@/src/registry/magicui/grid-pattern";

export default function AudienceBanner() {
  return (
    <section
      className="
        relative
        isolate
        min-h-180
        overflow-hidden
        bg-background
        pt-28 pb-10
        sm:pt-32 
        md:pt-36 
      "
    >
      <GridPattern
        width={45}
        height={45}
        x={-1}
        y={-1}
        className="[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] opacity-40 dark:opacity-20"
      />
      <div className="relative z-20 mx-auto flex max-w-350 flex-col items-center px-5 sm:px-8">
        <BannerHeader
          badge="AI-powered learning for your career"
          heading={"Learn with direction\nMap your career step-by-step"}
          subHeading="Build a personalized learning roadmap based on your career goal, current skills, available time, and learning progress."
        />

        <BannerCta text="Create My Roadmap" href="/signup" />
      </div>

      {/* ── Endless 3D Concave Carousel ── */}
      <div className="relative z-10 w-full -mt-6 sm:-mt-14 md:-mt-20 lg:-mt-24">
        <CurvedCarousel slides={slides} />
      </div>
    </section>
  );
}
