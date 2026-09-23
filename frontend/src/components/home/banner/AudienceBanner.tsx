"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { useIsMounted } from "@/src/hooks/useIsMounted";

import BannerBackground from "./BannerBackground";
import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import StaticCoverflowRow from "./StaticCoverflowRow";
import MobileCardCarousel from "./MobileCardCarousel";
import { ProgressBridgeArc } from "../ProgressBridge/ProgressBridgeSection";

import { carouselItems, slides } from "./data";

export default function AudienceBanner() {
  const [activeIndex, setActiveIndex] = useState(3);
  const mounted = useIsMounted();
  const { data: session } = authClient.useSession();

  const activeItem = carouselItems[activeIndex] ?? carouselItems[3];

  const user = mounted ? session?.user : undefined;
  const userRole = (user as { role?: string } | undefined)?.role?.toUpperCase();

  const ctaHref = !user
    ? "/signin"
    : userRole === "ADMIN"
    ? "/dashboard/admin"
    : "/dashboard/learner";

  return (
    <section
      className="
        relative isolate flex h-[100dvh] w-full
        flex-col items-center justify-between
        overflow-hidden
        px-0
        pt-14 sm:pt-36 md:pt-38 lg:pt-55
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
          gap-2 sm:gap-3 md:gap-4
          my-auto py-1 sm:py-2
          min-h-0
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
        <div className="flex flex-col items-center justify-center w-full">
          <BannerCta text="Get Started" href={ctaHref} />
        </div>
      </div>

      {/* Netflix-style Curved Arc ONLY anchored seamlessly at the bottom of the banner viewport */}
      <div className="relative z-20 w-full mt-auto shrink-0">
        <ProgressBridgeArc />
      </div>
    </section>
  );
}