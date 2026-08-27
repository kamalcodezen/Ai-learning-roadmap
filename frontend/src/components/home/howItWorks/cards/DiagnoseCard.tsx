"use client";

import React from "react";
import { FiTarget, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import BorderGlow from "./BorderGlow";

export default function DiagnoseCard() {
  return (
    <div className="flex flex-col h-full">
      {/* UI Visual Window */}
      <BorderGlow>
        <div className="border-glow-inner relative p-5 flex flex-col justify-between min-h-[260px]">
          {/* Floating Badge Overlay */}
          <div className="absolute -top-3 -left-3 bg-card border border-border p-2.5 rounded-md shadow-lg flex items-center justify-center -rotate-6">
            <FiTarget className="w-5 h-5 text-primary" />
          </div>

          {/* Card Header */}
          <div className="mt-2">
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">Step 01</span>
            <h3 className="text-xl mt-0.5">Diagnose</h3>
          </div>

          {/* Inner Mock Visual */}
          <div className="soft-card rounded-md p-3 space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Target: Senior Frontend</span>
              <span className="font-bold text-primary">82% Match</span>
            </div>

            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full w-[82%]" />
            </div>

            <div className="pt-2 border-t border-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <FiCheckCircle className="w-3.5 h-3.5 text-primary" /> React & Next.js
                </span>
                <span className="text-muted-foreground">Strong</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <FiAlertCircle className="w-3.5 h-3.5 text-amber-500" /> System Design
                </span>
                <span className="text-amber-500 font-medium">Gap</span>
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* Bottom Context Text */}
      <p className="text-xs md:text-sm text-muted-foreground text-center mt-4 px-2 leading-relaxed">
        Assess your current skills against the requirements of your target career.
      </p>
    </div>
  );
}
