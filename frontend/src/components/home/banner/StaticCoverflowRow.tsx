"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface CoverflowSlide {
  src: string;
  alt: string;
}

export interface StaticCoverflowRowProps {
  slides: CoverflowSlide[];
  onActiveChange?: (index: number) => void;
  label?: string;
  className?: string;
}

/* Same constants as the original CoverflowCarousel defaults */
const CARD_WIDTH = "clamp(150px, 20vw, 240px)";
const GAP = 0.05;
const PITCH_PERCENT = (1 + GAP) * 100;
const ROTATE = 44;
const DEPTH = 0.6;
const FALLOFF = 0.56;
const PERSPECTIVE = 3;

export default function StaticCoverflowRow({
  slides,
  onActiveChange,
  label = "Cover gallery",
  className,
}: StaticCoverflowRowProps) {
  const count = slides.length;
  const center = (count - 1) / 2;

  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [width, setWidth] = React.useState(0);
  const [hovered, setHovered] = React.useState<number | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  React.useEffect(() => {
    const measure = () => {
      const card = cardRefs.current[0];
      if (card) setWidth(card.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (cardRefs.current[0]) observer.observe(cardRefs.current[0]);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: CARD_WIDTH }}
      role="region"
      aria-label={label}
    >
      <div
        className="flex items-center justify-center py-10"
        style={{
          perspective: `calc(var(--cf-card) * ${PERSPECTIVE})`,
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          className="flex select-none items-center"
          style={{
            transformStyle: "preserve-3d",
            marginLeft: `calc(var(--cf-card) * ${GAP / 2})`,
            marginRight: `calc(var(--cf-card) * ${GAP / 2})`,
          }}
        >
          {slides.map((slide, index) => {
            const offset = index - center;
            const distance = Math.abs(offset);
            const ramp = Math.pow(distance, FALLOFF);
            const restTilt = Math.min(ROTATE * ramp, 82) * Math.sign(offset || 1);
            const restZ = -DEPTH * width * ramp;
            const isHovered = hovered === index;

            return (
              <motion.div
                key={index}
                role="group"
                aria-roledescription="card"
                aria-label={`${index + 1} of ${count}`}
                className="relative shrink-0 cursor-pointer"
                style={{
                  width: "var(--cf-card)",
                  transformStyle: "preserve-3d",
                }}
                onMouseEnter={() => {
                  setHovered(index);
                  onActiveChange?.(index);
                }}
                initial={{
                  opacity: 1,
                  x: `${-offset * PITCH_PERCENT}%`,
                }}
                animate={
                  inView
                    ? { opacity: 1, x: "0%" }
                    : { opacity: 1, x: `${-offset * PITCH_PERCENT}%` }
                }
                transition={{
                  type: "spring",
                  stiffness: 65,
                  damping: 15,
                  mass: 0.9,
                }}
              >
                <motion.div
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="group aspect-[4/5] overflow-hidden rounded-xl bg-card shadow-[var(--shadow)] will-change-transform transition-shadow duration-300 dark:hover:shadow-[0_0_25px_rgba(206,255,31,0.15),0_0_50px_rgba(206,255,31,0.05)]"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{
                    rotateY: isHovered ? -restTilt * 0.3 : -restTilt,
                    z: isHovered ? restZ * 0.4 : restZ,
                    scale: isHovered ? 1.06 : 1,
                    opacity: 1,
                    zIndex:
                      100 - Math.round(distance) * 2 + (offset < 0 ? 1 : 0),
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    draggable={false}
                    className="h-full w-full select-none object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
