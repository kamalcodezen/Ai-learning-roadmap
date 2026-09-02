"use client";

import { useState } from "react";

import BannerBackground from "./BannerBackground";
import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import StaticCoverflowRow from "./StaticCoverflowRow";
import MobileCardCarousel from "./MobileCardCarousel";

import { carouselItems, slides } from "./data";

export default function AudienceBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = carouselItems[activeIndex];

  return (
    <section
      className="
        relative
        isolate
        w-full
        flex
        items-center
        justify-center
        overflow-hidden
        pt-20
        pb-8
        sm:pt-24
        sm:pb-12
        sm:min-h-screen
        bg-[#f4edff]
        dark:bg-background
      "
    >
      <BannerBackground image={activeItem.image} title={activeItem.title} />

      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center justify-center px-6">
        <BannerHeader
          badge="A smarter way to learn"
          heading={activeItem.title}
          subHeading={activeItem.description}
        />

        <div className="hidden w-full sm:block">
          <StaticCoverflowRow
            slides={slides}
            onActiveChange={setActiveIndex}
            label="Aurevo learning gallery"
          />
        </div>

        <div className="w-full sm:hidden">
          <MobileCardCarousel slides={slides} onActiveChange={setActiveIndex} />
        </div>

        <BannerCta text="Get Started" href="/signup" />
      </div>
    </section>
  );
}
