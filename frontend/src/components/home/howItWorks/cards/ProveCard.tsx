"use client";

import React from "react";
import { FiGitBranch, FiShield, FiExternalLink } from "react-icons/fi";
import BorderGlow from "./BorderGlow";

export default function ProveCard() {
  return (
    <div className="flex flex-col h-full">
      <BorderGlow>
        <div className="border-glow-inner relative p-5 flex flex-col justify-between min-h-[260px]">
          <div className="absolute -bottom-3 -left-3 bg-card border border-border p-2.5 rounded-xl shadow-lg flex items-center justify-center -rotate-3">
            <FiGitBranch className="w-5 h-5 text-primary" />
          </div>

          <div className="mt-2">
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">Step 03</span>
            <h3 className="text-xl font-bold mt-0.5">Prove</h3>
          </div>

          <div className="soft-card rounded-2xl p-3 mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold">E-Commerce API</span>
              </div>
              <FiExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border">
              <FiShield className="w-4 h-4 text-primary shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold">Verified Skill State</p>
                <p className="text-muted-foreground text-[10px]">Tests passed!</p>
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      <p className="text-xs md:text-sm text-muted-foreground text-center mt-4 px-2 leading-relaxed">
        Turn what you learn into real projects and measurable skill evidence.
      </p>
    </div>
  );
}
