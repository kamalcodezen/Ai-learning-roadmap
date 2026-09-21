"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import FeatureHeader from "./FeatureHeader";
import FeatureCard from "./FeatureCard";
import FeatureTooltipModal from "./FeatureTooltipModal";
import { featureItems } from "./featureData";
import { GridPattern } from "@/src/registry/magicui/grid-pattern";

export default function FeaturesSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="features"
      className="section-pad relative w-full overflow-hidden px-0 sm:px-8 md:px-12"
    >
      <GridPattern
        width={45}
        height={45}
        x={-1}
        y={-1}
        className="[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] opacity-40 dark:opacity-20"
      />
      <div className="global-pos relative z-20">
        <FeatureHeader />

        {/* Mobile Swiper (below sm) — no border animation */}
        <div className="block sm:hidden">
          <Swiper
            slidesPerView={1.5}
            centeredSlides={true}
            spaceBetween={20}
            grabCursor={true}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="features-swiper"
          >
            {featureItems.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="relative flex flex-col">
                  <FeatureCard feature={item} hideBorder />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Tablet & Desktop Grid (sm and up) — with hover border */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
          {featureItems.map((item, index) => {
            const isActive = activeId === item.id;
            const tooltipPosition =
              index === 3 || index === featureItems.length - 1
                ? "left"
                : "right";

            return (
              <div
                key={item.id}
                className={`relative flex flex-col cursor-pointer ${
                  parseInt(item.id) > 4 ? "hidden lg:block" : ""
                }`}
                onMouseEnter={() => setActiveId(item.id)}
                onMouseLeave={() => setActiveId(null)}
                onClick={() => handleCardClick(item.id)}
              >
                <FeatureCard feature={item} />
                <FeatureTooltipModal
                  feature={isActive ? item : null}
                  position={tooltipPosition}
                  onClose={() => setActiveId(null)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
