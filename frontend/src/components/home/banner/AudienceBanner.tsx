"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";

import BannerBackground from "./BannerBackground";
import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import StaticCoverflowRow from "./StaticCoverflowRow";
import MobileCardCarousel from "./MobileCardCarousel";
import ProgressBridgeSection from "../ProgressBridge/ProgressBridgeSection";

import { carouselItems, slides } from "./data";

export default function AudienceBanner() {
  const [activeIndex, setActiveIndex] = useState(3);
  const { data: session } = authClient.useSession();

  const activeItem = carouselItems[activeIndex];

  const user = session?.user;
  const userRole = (user as { role?: string } | undefined)?.role?.toUpperCase();

  const ctaHref = !user
    ? "/signin"
    : userRole === "ADMIN"
    ? "/dashboard/admin"
    : "/dashboard/learner";

  return (
    <section
      className="
        relative isolate flex min-h-[100svh] w-full
        flex-col items-center justify-between
        overflow-hidden
        px-0
        pt-16 sm:pt-20 md:pt-22 lg:pt-24
        pb-0
      "
    >
      {/* Background */}
      <BannerBackground image={activeItem.image} title={activeItem.title} video={activeItem.video} />

      {/* Center Content */}
      <div
        className="
          relative z-10
          flex w-full max-w-7xl flex-1
          flex-col items-center justify-center
          gap-4
          sm:gap-5
          md:gap-6
          my-auto py-2
        "
      >
        {/* Header (Eyebrow above Big Heading) */}
        <div className="w-full">
          <BannerHeader
            badge="Track Your Journey"
            heading={activeItem.title}
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
          <MobileCardCarousel
            slides={slides}
            onActiveChange={setActiveIndex}
            initialSlide={3}
          />
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center justify-center w-full pt-1">
          <BannerCta text="Get Started" href={ctaHref} />
        </div>
      </div>

      {/* Netflix-style Curved Arc & Marquee anchored seamlessly at the bottom of the banner viewport */}
      <div className="relative z-20 w-full mt-auto">
        <ProgressBridgeSection />
      </div>
    </section>
  );
}