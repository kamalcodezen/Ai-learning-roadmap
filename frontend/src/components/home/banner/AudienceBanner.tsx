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
        relative isolate flex min-h-[100svh] w-full
        items-center justify-center
        overflow-hidden
        px-4
        py-20
        sm:px-6 sm:py-24
        md:px-8 md:py-20 md:pt-30
        lg:px-10
        xl:px-12
      "
    >
      {/* Background */}
      <BannerBackground image={activeItem.image} title={activeItem.title} />

      {/* Content */}
      <div
        className="
          relative z-10
          flex w-full max-w-7xl
          flex-col items-center justify-center
          gap-6
          sm:gap-8
          md:gap-9
          lg:gap-10
        "
      >
        {/* Header */}
        <div className="w-full">
          <BannerHeader
            badge="A smarter way to learn"
            heading={activeItem.title}
            subHeading={activeItem.description}
          />
        </div>

        {/* Desktop / Tablet Coverflow */}
        <div
          className="
            hidden w-full
            sm:block
          "
        >
          <StaticCoverflowRow
            slides={slides}
            onActiveChange={setActiveIndex}
            label="Aurevo learning gallery"
          />
        </div>

        {/* Mobile Carousel */}
        <div
          className="
            block w-full
            sm:hidden
          "
        >
          <MobileCardCarousel slides={slides} onActiveChange={setActiveIndex} />
        </div>

        {/* CTA */}
        <div className="flex w-full justify-center">
          <BannerCta text="Get Started" href="/signup" />
        </div>
      </div>
    </section>
  );
}
