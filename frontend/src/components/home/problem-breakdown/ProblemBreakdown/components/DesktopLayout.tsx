"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { NarrativeState } from "../data/narrativeStates";
import BentoCanvas from "./BentoCanvas";
import WireTimeline from "./WireTimeline";
import ProblemHeader from "../../ProblemHeader";

interface DesktopLayoutProps {
  states: NarrativeState[];
}

/**
 * Desktop-only (lg+) scroll-driven layout.
 * Pins both ProblemHeader, BentoCanvas, and WireTimeline in viewport
 * while scrolling down through the narrative phases one by one.
 */
export default function DesktopLayout({ states }: DesktopLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.33) {
        setActiveState(0);
      } else if (latest < 0.66) {
        setActiveState(1);
      } else {
        setActiveState(2);
      }
    });
  }, [scrollYProgress]);

  return (
    <div
      ref={containerRef}
      className="relative hidden h-[260vh] lg:block mb-13"
    >
      {/* হেডার ও কন্টেন্ট একসাথে সেন্টারে স্টিকি হয়ে থাকবে */}
      <div className="sticky top-20 flex h-[calc(100vh-6rem)] w-full flex-col justify-center gap-6 mb-12">
        {/* টপ হেডার যা এই সেকশনের সাথে সবসময় লক থাকবে */}
        <ProblemHeader />

        {/* মেইন ক্যানভাস ও টাইমলাইন */}
        <div className="flex w-full items-center justify-between gap-8">
          <BentoCanvas
            activeState={activeState}
            activeEyebrow={states[activeState]?.eyebrow}
          />
          <WireTimeline
            states={states}
            activeState={activeState}
            onSelectState={setActiveState}
          />
        </div>
      </div>
    </div>
  );
}
