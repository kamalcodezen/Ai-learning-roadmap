"use client";

import ReadinessComparison from "../ReadinessComparison/ReadinessComparison";
import { narrativeStates } from "./data/narrativeStates";
import {
  ProblemBreakdownStyles,
  MobileLayout,
  DesktopLayout,
} from "./components";
import ProblemHeader from "../ProblemHeader";

export default function ProblemBreakdown() {
  return (
    <section id="problem-breakdown" className="section-pad !pt-2 sm:!pt-3 md:!pt-7 lg:!pt-8 xl:!pt-4 relative w-full overflow-x-clip transition-colors duration-300">
      {/* TURBOPACK-SAFE HIGH-CONTRAST INLINE STYLES */}
      <ProblemBreakdownStyles />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* শুধুমাত্র মোবাইলে দৃশ্যমান, ডেস্কটপে হাইড থাকবে */}
        <div className="block lg:hidden mt-2 sm:mt-3 md:mt-5">
          <ProblemHeader />
        </div>

        {/* MOBILE LAYOUT */}
        <MobileLayout states={narrativeStates} />

        {/* DESKTOP LAYOUT */}
        <DesktopLayout states={narrativeStates} />

        {/* CLIMAX */}
        <div>
          <ReadinessComparison />
        </div>
      </div>
    </section>
  );
}
