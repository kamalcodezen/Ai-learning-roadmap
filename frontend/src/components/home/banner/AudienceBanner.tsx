"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { authClient } from "@/src/lib/auth-client";

import BannerBackground from "./BannerBackground";
import BannerHeader from "./BannerHeader";
import BannerCta from "./BannerCta";
import StaticCoverflowRow from "./StaticCoverflowRow";
import MobileCardCarousel from "./MobileCardCarousel";
import { renderHighlighted } from "./TextBody";

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
        items-center justify-center
        overflow-hidden
        px-0
        py-20
        sm:px-6 sm:py-24
        md:min-h-0 md:px-8 md:py-16 md:pt-28
        lg:min-h-0 lg:px-10 lg:py-20 lg:pt-32
        xl:min-h-[100svh] xl:px-12 xl:py-20 xl:pt-30
      "
    >
      {/* Background */}
      <BannerBackground image={activeItem.image} title={activeItem.title} video={activeItem.video} />

      {/* Content */}
      <div
        className="
          relative z-10
          flex w-full max-w-7xl
          flex-col items-center justify-center
          gap-5
          sm:gap-7
          md:gap-8
          lg:gap-9
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

        {/* Subtitle & CTA (Below cards, above button) */}
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 w-full">
          <motion.p
            key={`${activeItem.title}-subtitle`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: "easeOut",
            }}
            className="
              section-description
              max-w-xl
              px-4
              text-center
              font-poppins
              text-sm
              text-black dark:text-white
              font-medium
              dark:[text-shadow:0_3px_14px_rgba(0,0,0,0.65)]
              sm:text-lg
            "
          >
            {renderHighlighted(activeItem.description, true)}
          </motion.p>

          <BannerCta text="Get Started" href={ctaHref} />
        </div>
      </div>
    </section>
  );
}