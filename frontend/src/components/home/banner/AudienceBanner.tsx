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
        section-pad
        relative
        isolate
        h-screen
        overflow-hidden
        bg-[#f4edff]
        dark:bg-background
      "
    >
      <BannerBackground image={activeItem.image} title={activeItem.title} />

      <div className="global-pos relative z-10 flex flex-col items-center px-6">
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