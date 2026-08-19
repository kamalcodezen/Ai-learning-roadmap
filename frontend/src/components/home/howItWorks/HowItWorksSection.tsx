"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import TextHeader from "./TextHeader";
import DiagnoseCard from "./cards/DiagnoseCard";
import UnblockCard from "./cards/UnblockCard";
import ProveCard from "./cards/ProveCard";
import AdaptCard from "./cards/AdaptCard";

const cards = [
  { id: 1, Component: DiagnoseCard },
  { id: 2, Component: UnblockCard },
  { id: 3, Component: ProveCard },
  { id: 4, Component: AdaptCard },
];

const STACKED_MQ = "(max-width: 1023px)";

function subscribeIsStacked(callback: () => void) {
  const mq = window.matchMedia(STACKED_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsStackedSnapshot() {
  return window.matchMedia(STACKED_MQ).matches;
}

function getIsStackedServerSnapshot() {
  return false;
}

export default function HowItWorksSection() {
  const isStacked = useSyncExternalStore(
    subscribeIsStacked,
    getIsStackedSnapshot,
    getIsStackedServerSnapshot,
  );

  const mainRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({
    cardW: 320,
    gap: 32,
    viewport: 1200,
    count: cards.length,
    startX: 300,
    endX: -200,
    posStart: 0,
    posEnd: 0.5,
  });

  const { scrollYProgress } = useScroll();
  const x = useMotionValue(0);

  const apply = useCallback(
    (progress: number) => {
      if (isStacked) return;
      const m = metricsRef.current;
      const span = m.posEnd - m.posStart || 1;
      const t = Math.min(1, Math.max(0, (progress - m.posStart) / span));
      const currentX = m.startX + (m.endX - m.startX) * t;

      x.set(currentX);
    },
    [x, isStacked],
  );

  const measure = useCallback(() => {
    const el = carouselRef.current;
    const section = mainRef.current;
    if (!el || !section) return;

    const first = el.firstElementChild as HTMLElement | null;
    const cardW = first ? first.offsetWidth : 320;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 32;
    const viewport = window.innerWidth;
    const count = cards.length;
    const startX = 100;
    const endX = -100;

    const rect = section.getBoundingClientRect();
    const pageHeight = document.body.scrollHeight;
    const top = rect.top + window.scrollY;
    const bottom = top + section.offsetHeight;

    metricsRef.current = {
      cardW,
      gap,
      viewport,
      count,
      startX,
      endX,
      posStart: top / pageHeight,
      posEnd: bottom / pageHeight,
    };

    apply(scrollYProgress.get());
  }, [apply, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", apply);

  useEffect(() => {
    const onScroll = () => apply(scrollYProgress.get());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [apply, scrollYProgress]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  if (isStacked) {
    return (
      <section className="relative">
        <div className="flex flex-col items-center gap-8 px-5 py-16">
          <TextHeader />
          {cards.map(({ id, Component }) => (
            <div key={id} className="w-full max-w-105">
              <Component />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={mainRef} className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <TextHeader />

        <motion.div
          ref={carouselRef}
          style={{ x }}
          className="mt-10 flex w-max items-stretch gap-6 md:mt-12 md:gap-8"
        >
          {cards.map(({ id, Component }) => (
            <div
              key={id}
              className="h-85 w-[min(78vw,340px)] shrink-0 md:h-95 md:w-90"
            >
              <Component />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
