"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/src/lib/utils";

// Wrap function to keep value continuously within [min, max] range
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export interface MarqueeAnimationProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  direction?: "left" | "right";
  baseVelocity?: number;
  pauseOnHover?: boolean;
}

export function MarqueeAnimation({
  children,
  className,
  containerClassName,
  direction = "left",
  baseVelocity = -1.5,
  pauseOnHover = false,
}: MarqueeAnimationProps) {
  const baseX = useMotionValue(0);
  const isHovered = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1], {
    clamp: false,
  });

  // Wraps value between -25% and 0% across 4 identical content copies
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  const directionMultiplier = direction === "right" ? 1 : -1;
  const speed = Math.abs(baseVelocity) * directionMultiplier;

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) return;
    if (pauseOnHover && isHovered.current) return;

    let moveBy = speed * (delta / 2000);
    const currentVelocity = velocityFactor.get();
    moveBy += moveBy * Math.abs(currentVelocity);

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden whitespace-nowrap",
        containerClassName
      )}
      onMouseEnter={() => {
        if (pauseOnHover) isHovered.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) isHovered.current = false;
      }}
    >
      <motion.div
        className={cn(
          "flex w-max flex-nowrap items-center will-change-transform select-none",
          className
        )}
        style={{ x }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
