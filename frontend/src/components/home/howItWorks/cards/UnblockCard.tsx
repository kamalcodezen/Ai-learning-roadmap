"use client";

import React from "react";
import { FiLock, FiUnlock, FiArrowRight } from "react-icons/fi";
import BorderGlow from "./BorderGlow";

export default function UnblockCard() {
  return (
    <div className="flex flex-col h-full">
      <BorderGlow>
        <div className="border-glow-inner relative p-5 flex flex-col justify-between min-h-[260px]">
          <div className="absolute -top-3 -right-3 bg-card border border-border p-2.5 rounded-xl shadow-lg flex items-center justify-center rotate-6">
            <FiUnlock className="w-5 h-5 text-primary" />
          </div>

          <div className="mt-2">
            <span className="text-caption font-mono font-semibold text-primary uppercase tracking-wider">Step 02</span>
            <h3 className="text-h3 mt-0.5">Unblock</h3>
          </div>

          <div className="soft-card rounded-2xl p-3 mt-3 space-y-2">
            <div className="flex items-center justify-between bg-card p-2 rounded-xl border border-border">
              <span className="text-caption font-medium">TypeScript Core</span>
              <span className="text-caption px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">Done</span>
            </div>

            <div className="flex justify-center my-0.5">
              <FiArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
            </div>

            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-2 rounded-xl">
              <div className="flex items-center gap-2">
                <FiLock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-caption font-semibold">State Management</span>
              </div>
              <span className="text-caption text-primary font-bold">Unlocked</span>
            </div>
          </div>
        </div>
      </BorderGlow>

      <p className="text-small text-muted-foreground text-center mt-4 px-2 leading-relaxed">
        Identify the missing knowledge and prerequisites standing in your way.
      </p>
    </div>
  );
}
