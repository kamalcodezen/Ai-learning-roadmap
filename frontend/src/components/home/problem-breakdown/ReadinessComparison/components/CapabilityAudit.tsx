"use client";

import { useState } from "react";
import AnimatedButton from "./AnimatedButton";
import { capabilities } from "../data/capabilities";

/**
 * Interactive 4-pillar capability audit — tab buttons to switch between
 * BUILD / SOLVE / EXPLAIN / PROVE comparisons.
 */
export default function CapabilityAudit() {
  const [activeCap, setActiveCap] = useState(0);

  return (
    <div className="mt-4 w-full max-w-4xl">
      <div className="text-center mb-8">
        <span className="font-mono text-small font-bold uppercase tracking-[0.2em] dark:text-primary">
          The 4 Proof Pillars
        </span>
        <h4 className="font-poppins text-h2 font-medium text-foreground mt-2 text-balance">
          Why 67% of Self-Learners Never Get Hired
        </h4>
      </div>

      {/* Interactive Capability Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        {capabilities.map((item, idx) => (
          <AnimatedButton
            key={item.tag}
            text={item.tag}
            onClick={() => setActiveCap(idx)}
            isActive={activeCap === idx}
            className={
              activeCap === idx
                ? "shadow-[0_0_20px_rgba(var(--primary),0.4)] ring-2 ring-primary"
                : ""
            }
          />
        ))}
      </div>

      {/* Capability Detailed Comparison Card */}
      <div className="mt-8 rounded-t-3xl sm:rounded-b-3xl rounded-b-none border-2 border-border bg-card p-6 md:p-8 ">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <span className="font-mono text-caption font-semibold uppercase tracking-widest text-primary">
              Competency Breakdown
            </span>
            <h5 className="font-poppins text-h3 font-medium text-foreground mt-0.5">
              {capabilities[activeCap].label}
            </h5>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-md border border-border bg-card-soft text-muted-foreground">
            PILLAR 0{activeCap + 1}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standard Way */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5">
            <span className="flex items-center gap-2 font-mono text-caption font-bold uppercase tracking-wider text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Ordinary Video Course
            </span>
            <p className="mt-2.5 text-body leading-relaxed text-muted-foreground">
              {capabilities[activeCap].tutorial}
            </p>
          </div>

          {/* Our Continuous OS */}
          <div className="rounded-2xl border border-primary/40 bg-primary/[0.04] p-5">
            <span className="flex items-center gap-2 font-mono text-caption font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Our Continuous OS
            </span>
            <p className="mt-2.5 text-body leading-relaxed text-foreground font-medium">
              {capabilities[activeCap].adaptiveOs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
