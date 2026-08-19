"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { NarrativeState } from "../data/narrativeStates";
import BentoCanvas from "./BentoCanvas";
import WireTimeline from "./WireTimeline";

interface DesktopLayoutProps {
  states: NarrativeState[];
}

/**
 * Desktop-only (lg+) scroll-driven layout with sticky BentoCanvas on the left
 * and the WireTimeline on the right.
 * Owns the scroll-tracking logic that determines the active narrative state.
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
      if (latest < 0.34) {
        setActiveState(0);
      } else if (latest < 0.67) {
        setActiveState(1);
      } else {
        setActiveState(2);
      }
    });
  }, [scrollYProgress]);

  return (
    <div
      ref={containerRef}
      className="relative mt-14 hidden h-[110vh] items-start justify-between lg:flex"
    >
      <BentoCanvas
        activeState={activeState}
        activeEyebrow={states[activeState]?.eyebrow}
      />
      <WireTimeline states={states} activeState={activeState} />
    </div>
  );
}
