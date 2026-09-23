"use client";

/* eslint-disable @next/next/no-img-element */

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-coverflow";

export interface MobileCarouselSlide {
  src: string;
  alt: string;
  video?: string;
}

interface MobileCardCarouselProps {
  slides: MobileCarouselSlide[];
  onActiveChange?: (index: number) => void;
  initialSlide?: number;
}

export default function MobileCardCarousel({
  slides,
  onActiveChange,
  initialSlide = 0,
}: MobileCardCarouselProps) {
  const handleChange = (swiper: SwiperType) => {
    onActiveChange?.(swiper.realIndex);
  };

  return (
    <div className="w-full py-2">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop
        slidesPerView={1.5}
        spaceBetween={16}
        // Homepage banner mobile device card height controller
        breakpoints={{
          350: { slidesPerView: 1.7 },
          450: { slidesPerView: 2 },
          500: { slidesPerView: 2.7 },
          600: { slidesPerView: 3 },
        }}
        initialSlide={initialSlide}
        coverflowEffect={{
          rotate: 24,
          stretch: 0,
          depth: 140,
          modifier: 1,
          slideShadows: false,
        }}
        onSwiper={(swiper) => {
          if (initialSlide !== undefined) {
            swiper.slideToLoop(initialSlide, 0, false);
          }
        }}
        onSlideChange={handleChange}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow)] transition-shadow duration-300 my-2 sm:my-3">
              {slide.video ? (
                <video
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  aria-hidden
                  draggable={false}
                  className="aspect-[4/5] h-full w-full select-none object-cover"
                />
              ) : (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="aspect-[4/5] h-full w-full select-none object-cover"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}