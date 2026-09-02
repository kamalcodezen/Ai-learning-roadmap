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
    <section id="problem-breakdown" className="section-pad !pt-4 sm:!pt-6 lg:!pt-16 relative w-full overflow-x-clip transition-colors duration-300">
      {/* TURBOPACK-SAFE HIGH-CONTRAST INLINE STYLES */}
      <ProblemBreakdownStyles />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* শুধুমাত্র মোবাইলে দৃশ্যমান, ডেস্কটপে হাইড থাকবে */}
        <div className="block lg:hidden mt-5 sm:mt-8">
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
