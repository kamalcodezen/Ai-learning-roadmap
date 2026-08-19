"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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

// শুধুমাত্র মোবাইলের জন্য (sm এর নিচে অর্থাৎ < 640px)
const MOBILE_ONLY_MQ = "(max-width: 639px)";

function subscribeIsMobile(callback: () => void) {
  const mq = window.matchMedia(MOBILE_ONLY_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_ONLY_MQ).matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

export default function HowItWorksSection() {
  const isMobile = useSyncExternalStore(
    subscribeIsMobile,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );

  const mainRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const updateRange = () => {
      if (!carouselRef.current) return;
      const totalWidth = carouselRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      setScrollRange(Math.max(0, totalWidth - viewportWidth + 120));
    };

    updateRange();
    window.addEventListener("resize", updateRange);
    return () => window.removeEventListener("resize", updateRange);
  }, [isMobile]);

  const x = useTransform(scrollYProgress, [0, 1], ["0px", `-${scrollRange}px`]);

  // ১. শুধুমাত্র মোবাইলে (sm এর নিচে) একটার নিচে একটা (Stacked)
  if (isMobile) {
    return (
      <section
        id="how-it-works"
        className="relative w-full  overflow-hidden px-4 sm:px-8 md:px-12 "
      >
        <div className="container mx-auto max-w-7xl py-13 flex flex-col items-center gap-8">
          <TextHeader />
          <div className="flex w-full flex-col items-center gap-6">
            {cards.map(({ id, Component }) => (
              <div key={id} className="w-full max-w-[340px]">
                <Component />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ২. sm, md, lg এবং তার ওপরে পাশাপাশি হরাইজন্টাল স্ক্রোল
  return (
    <section
      id="how-it-works"
      ref={mainRef}
      className="relative w-full py-13 pt-4 px-4 sm:px-8 md:px-12"
      style={{ height: "250vh" }}
    >
      <div className="sticky top-10 flex h-screen w-full flex-col justify-center overflow-hidden">
        {/* হেডার */}
        <div className="container mx-auto max-w-7xl">
          <TextHeader />
        </div>

        {/* কার্ড ক্যারোজেল */}
        <div className="container mx-auto max-w-7xl">
          <motion.div
            ref={carouselRef}
            style={{ x }}
            className="mt-8 flex w-max items-stretch gap-6 sm:mt-10 md:mt-12 md:gap-8"
          >
            {cards.map(({ id, Component }) => (
              <div
                key={id}
                className="h-85 w-[300px] shrink-0 sm:w-[320px] md:h-95 md:w-[360px]"
              >
                <Component />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
