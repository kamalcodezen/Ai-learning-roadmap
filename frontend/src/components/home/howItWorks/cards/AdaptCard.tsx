"use client";

import React from "react";
import { FiTrendingUp, FiCheck } from "react-icons/fi";
import { TbSparkles } from "react-icons/tb";
import BorderGlow from "./BorderGlow";

export default function AdaptCard() {
  return (
    <div className="flex flex-col h-full">
      <BorderGlow>
        <div className="border-glow-inner relative p-5 flex flex-col justify-between min-h-[260px]">
          <div className="absolute -top-3 -right-3 bg-card border border-border p-2.5 rounded-xl shadow-lg flex items-center justify-center rotate-6">
            <TbSparkles className="w-5 h-5 text-primary" />
          </div>

          <div className="mt-2">
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">Step 04</span>
            <h3 className="text-xl font-bold mt-0.5">Adapt</h3>
          </div>

          <div className="soft-card rounded-2xl p-3 mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Roadmap Shift</span>
              <FiTrendingUp className="w-4 h-4 text-primary" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground line-through">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <FiCheck className="w-2.5 h-2.5" />
                </div>
                Milestone Alpha
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <div className="w-4 h-4 rounded-full bg-primary text-secondary flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                Adaptive Next Steps
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      <p className="text-xs md:text-sm text-muted-foreground text-center mt-4 px-2 leading-relaxed">
        Continuously adjust your learning path as your progress changes.
      </p>
    </div>
  );
}
