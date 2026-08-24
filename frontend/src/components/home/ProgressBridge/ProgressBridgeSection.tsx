"use client";

import React from "react";
import {
  LuCompass,
  LuBrainCircuit,
  LuMilestone,
} from "react-icons/lu";

export default function ProgressBridgeSection() {

  return (
    <section className="section-pad relative w-full overflow-hidden">
      {/* ========================================================
          1. ICONIC HORIZONTAL LEARNING ROADMAP PULSE LINE
          ======================================================== */}
      <div className="relative w-full">
        {/* ব্যাকগ্রাউন্ড বেস লাইন */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-border" />

        {/* সেন্ট্রাল নিয়ন গ্রিন পালস গ্রেডিয়েন্ট */}
        <div className="absolute inset-x-0 top-1/2 mx-auto h-[2px] w-3/4 -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent shadow-[0_0_15px_var(--color-primary)]" />
        <div className="absolute inset-x-0 top-1/2 mx-auto h-[6px] w-1/4 -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent blur-[3px]" />

        {/* ইন্টারঅ্যাক্টিভ নোডস (AI Learning Roadmap Trail) */}
        <div className="global-pos flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Node 1: AI Roadmap Active Path */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            </span>
            <LuCompass className="size-3.5 text-[var(--color-primary)]" />
            <span className="font-mono text-caption font-medium text-muted-foreground">
              AI Roadmap: Active Path
            </span>
          </div>

          {/* Node 2: Adaptive Milestone Engine */}
          <div className="hidden items-center gap-2 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] sm:flex">
            <LuBrainCircuit className="size-3.5 text-[var(--color-primary)] animate-pulse" />
            <span className="font-mono text-caption font-semibold text-[var(--color-primary)]">
              Adaptive Roadmap Engine
            </span>
          </div>

          {/* Node 3: Continuous Skill Sync */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 backdrop-blur-md">
            <LuMilestone className="size-3.5 text-emerald-400" />
            <span className="font-mono text-caption text-muted-foreground">
              Continuous Skill Sync
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
