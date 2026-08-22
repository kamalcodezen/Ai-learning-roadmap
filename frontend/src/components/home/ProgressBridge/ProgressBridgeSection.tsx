"use client";

import React from "react";
import {
  LuCompass,
  LuBrainCircuit,
  LuMilestone,
} from "react-icons/lu";

export default function ProgressBridgeSection() {

  return (
    <section className="relative w-full overflow-hidden py-10">
      {/* ========================================================
          1. ICONIC HORIZONTAL LEARNING ROADMAP PULSE LINE
          ======================================================== */}
      <div className="relative w-full">
        {/* ব্যাকগ্রাউন্ড বেস লাইন */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-white/10" />

        {/* সেন্ট্রাল নিয়ন গ্রিন পালস গ্রেডিয়েন্ট */}
        <div className="absolute inset-x-0 top-1/2 mx-auto h-[2px] w-3/4 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#CEFF1F] to-transparent shadow-[0_0_15px_#CEFF1F]" />
        <div className="absolute inset-x-0 top-1/2 mx-auto h-[6px] w-1/4 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#CEFF1F] to-transparent blur-[3px]" />

        {/* ইন্টারঅ্যাক্টিভ নোডস (AI Learning Roadmap Trail) */}
        <div className="global-pos flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Node 1: AI Roadmap Active Path */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0B0F19]/90 px-3 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#CEFF1F] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#CEFF1F]"></span>
            </span>
            <LuCompass className="size-3.5 text-[#CEFF1F]" />
            <span className="font-mono text-caption font-medium text-slate-300">
              AI Roadmap: Active Path
            </span>
          </div>

          {/* Node 2: Adaptive Milestone Engine */}
          <div className="hidden items-center gap-2 rounded-full border border-[#CEFF1F]/30 bg-[#131824] px-3.5 py-1.5 shadow-[0_0_15px_rgba(206,255,31,0.15)] sm:flex">
            <LuBrainCircuit className="size-3.5 text-[#CEFF1F] animate-pulse" />
            <span className="font-mono text-caption font-semibold text-[#CEFF1F]">
              Adaptive Roadmap Engine
            </span>
          </div>

          {/* Node 3: Continuous Skill Sync */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0B0F19]/90 px-3 py-1.5 backdrop-blur-md">
            <LuMilestone className="size-3.5 text-emerald-400" />
            <span className="font-mono text-caption text-slate-300">
              Continuous Skill Sync
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
