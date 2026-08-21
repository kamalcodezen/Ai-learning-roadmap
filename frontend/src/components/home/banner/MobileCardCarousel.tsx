"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-coverflow";

export interface MobileCarouselSlide {
  src: string;
  alt: string;
}

interface MobileCardCarouselProps {
  slides: MobileCarouselSlide[];
  onActiveChange?: (index: number) => void;
}

export default function MobileCardCarousel({
  slides,
  onActiveChange,
}: MobileCardCarouselProps) {
  const handleChange = (swiper: SwiperType) => {
    onActiveChange?.(swiper.realIndex);
  };

  return (
    <div className="w-full py-6">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop
        slidesPerView={1.9}
        spaceBetween={16}
        initialSlide={0}
        coverflowEffect={{
          rotate: 24,
          stretch: 0,
          depth: 140,
          modifier: 1,
          slideShadows: false,
        }}
        onSwiper={(swiper) => onActiveChange?.(swiper.realIndex)}
        onSlideChange={handleChange}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow)] transition-shadow duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                className="aspect-[4/5] h-full w-full select-none object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
