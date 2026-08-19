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
    <section className="relative w-full overflow-x-clip bg-background py-13 transition-colors duration-300">
      {/* TURBOPACK-SAFE HIGH-CONTRAST INLINE STYLES */}
      <ProblemBreakdownStyles />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* শুধুমাত্র মোবাইলে দৃশ্যমান, ডেস্কটপে হাইড থাকবে */}
        <div className="block lg:hidden">
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
