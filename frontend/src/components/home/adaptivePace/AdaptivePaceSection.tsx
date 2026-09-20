"use client";

import RoadmapSimulatorCard from "./RoadmapSimulatorCard";
import ZeroGuiltRecoveryCard from "./ZeroGuiltRecoveryCard";
import AIDependencyMeterCard from "./AIDependencyMeterCard";

export default function AdaptivePaceSection() {
  return (
    <section
      id="adaptive-resilience"
      className="section-pad relative w-full overflow-hidden px-4 sm:px-8 md:px-12"
    >
      <div className="global-pos relative z-20">
        {/* Section Header */}
        <div className="mx-auto flex w-full flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3.5 py-1 text-xs font-semibold text-[var(--color-primary)] mb-3">
            <span>Adaptive Resilience & Pace Control</span>
          </div>

          <h2 className="section-title font-bold mt-1">
            Engineered for <span className="text-brand">Real-Life Learning</span>
          </h2>
          <p className="section-subtitle mt-2 max-w-full">
            Flexible commitment pacing, zero-guilt recovery after breaks, and autonomous problem-solving tracking to ensure you land top tech roles
          </p>
        </div>

        {/* 3 Unified Cards One After Another */}
        <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
          {/* Feature 01: Roadmap Velocity & Pace Simulator */}
          <div id="roadmap-simulator">
            <RoadmapSimulatorCard />
          </div>

          {/* Feature 02: Zero-Guilt Recovery Engine */}
          <div id="zero-guilt-recovery">
            <ZeroGuiltRecoveryCard />
          </div>

          {/* Feature 03: AI Dependency & Problem-Solving Meter */}
          <div id="ai-dependency-meter">
            <AIDependencyMeterCard />
          </div>
        </div>
      </div>
    </section>
  );
}
