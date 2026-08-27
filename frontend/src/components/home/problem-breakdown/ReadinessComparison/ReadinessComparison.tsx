"use client";

import { CapabilityAudit } from "./components";

export default function ReadinessComparison() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
      {/* AMBIENT GLOW BACKDROP */}
      <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 h-[350px] w-full max-w-[600px] rounded-full bg-primary/10 blur-[130px] -z-10" />

      {/* INTERACTIVE 4-PILLAR BENTO GRID */}
      <CapabilityAudit />
    </div>
  );
}
