"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "@/src/components/home/problem-breakdown/ReadinessComparison/components/AnimatedButton";
import RoadmapSimulatorCard from "./RoadmapSimulatorCard";
import ZeroGuiltRecoveryCard from "./ZeroGuiltRecoveryCard";
import AIDependencyMeterCard from "./AIDependencyMeterCard";

const ADAPTIVE_FEATURES = [
  {
    id: "simulator",
    title: "PACE SIMULATOR",
    mobileTitle: "SIMULATOR",
    Component: RoadmapSimulatorCard,
  },
  {
    id: "recovery",
    title: "ZERO-GUILT RECOVERY",
    mobileTitle: "RECOVERY",
    Component: ZeroGuiltRecoveryCard,
  },
  {
    id: "ai-meter",
    title: "AI DEPENDENCY METER",
    mobileTitle: "AI DEPENDENCY METER",
    Component: AIDependencyMeterCard,
  },
];

export default function AdaptivePaceSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const ActiveComponent = ADAPTIVE_FEATURES[activeTab].Component;

  return (
    <section
      id="adaptive-resilience"
      className="section-pad relative w-full overflow-hidden px-4 sm:px-8 md:px-12"
    >
      <div className="global-pos relative z-20">
        {/* Section Header */}
        <div className="mx-auto flex w-full flex-col items-center text-center mb-10 sm:mb-14">
          <h2 className="section-title font-bold mt-1">
            Engineered for <span className="text-brand">Real-Life Learning</span>
          </h2>
          <p className="section-subtitle mt-2 max-w-full">
            Flexible commitment pacing, zero-guilt recovery after breaks, and autonomous problem-solving tracking to ensure you land top tech roles
          </p>

          {/* ── PILL NAVIGATION (Space Optimized Button Controller) ── */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4 pt-5 sm:pt-6 mx-auto w-full max-w-[360px] sm:max-w-none">
            {/* Row 1 on mobile: first 2 buttons side-by-side in one line */}
            <div className="flex sm:contents items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
              <AnimatedButton
                key={ADAPTIVE_FEATURES[0].id}
                text={
                  <>
                    <span className="hidden sm:inline">{ADAPTIVE_FEATURES[0].title}</span>
                    <span className="inline sm:hidden">{ADAPTIVE_FEATURES[0].mobileTitle}</span>
                  </>
                }
                onClick={() => setActiveTab(0)}
                isActive={activeTab === 0}
                className="flex-1 sm:flex-initial justify-center"
              />
              <AnimatedButton
                key={ADAPTIVE_FEATURES[1].id}
                text={
                  <>
                    <span className="hidden sm:inline">{ADAPTIVE_FEATURES[1].title}</span>
                    <span className="inline sm:hidden">{ADAPTIVE_FEATURES[1].mobileTitle}</span>
                  </>
                }
                onClick={() => setActiveTab(1)}
                isActive={activeTab === 1}
                className="flex-1 sm:flex-initial justify-center"
              />
            </div>

            {/* Row 2 on mobile: 3rd button */}
            <AnimatedButton
              key={ADAPTIVE_FEATURES[2].id}
              text={
                <>
                  <span className="hidden sm:inline">{ADAPTIVE_FEATURES[2].title}</span>
                  <span className="inline sm:hidden">{ADAPTIVE_FEATURES[2].mobileTitle}</span>
                </>
              }
              onClick={() => setActiveTab(2)}
              isActive={activeTab === 2}
            />
          </div>
        </div>

        {/* ── ACTIVE FEATURE CARD DISPLAY ── */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={ADAPTIVE_FEATURES[activeTab].id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
