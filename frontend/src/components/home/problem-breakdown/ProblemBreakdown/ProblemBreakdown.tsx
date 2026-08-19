"use client";

import ProblemHeader from "../ProblemHeader";
import ReadinessComparison from "../ReadinessComparison/ReadinessComparison";
import { narrativeStates } from "./data/narrativeStates";
import {
  ProblemBreakdownStyles,
  MobileLayout,
  DesktopLayout,
} from "./components";

export default function ProblemBreakdown() {
  return (
    <section className="relative w-full overflow-hidden bg-background pb-1 transition-colors duration-300">
      {/* TURBOPACK-SAFE HIGH-CONTRAST INLINE STYLES */}
      <ProblemBreakdownStyles />

      <div className="container-custom mx-auto max-w-6xl">
        <ProblemHeader />

        {/* MOBILE LAYOUT */}
        <MobileLayout states={narrativeStates} />

        {/* DESKTOP LAYOUT */}
        <DesktopLayout states={narrativeStates} />

        {/* CLIMAX */}
        <div className="mt-14 md:mt-20">
          <ReadinessComparison />
        </div>
      </div>
    </section>
  );
}
