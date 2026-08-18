"use client";

import { useState } from "react";

import BannerBackground from "./BannerBackground";
import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import CoverflowCarousel from "./CoverflowCarousel";

import { carouselItems, slides } from "./data";

export default function AudienceBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeItem = carouselItems[hoveredIndex ?? activeIndex];

  return (
    <section
      className="
        relative
        isolate
        min-h-180
        overflow-hidden
        bg-[#faf8f2]
        py-20
        sm:py-24
        md:py-28
      "
    >
      <BannerBackground image={activeItem.image} title={activeItem.title} />

      <div className="mx-auto flex max-w-350 flex-col items-center px-5 sm:px-8">
        <BannerHeader
          badge="A smarter way to learn"
          heading={activeItem.title}
          subHeading={activeItem.description}
        />

        <div className="w-full">
          <CoverflowCarousel
            slides={slides}
            loop
            rotate={28}
            gap={0.08}
            autoplay
            autoplayDelay={3000}
            showPagination
            showNavigation
            cardWidth="clamp(150px, 20vw, 240px)"
            onSlideChange={setActiveIndex}
            onCardHover={setHoveredIndex}
            label="Aurevo learning carousel"
          />
        </div>

        <BannerCta text="Get Started" href="/signup" />
      </div>
    </section>
  );
}