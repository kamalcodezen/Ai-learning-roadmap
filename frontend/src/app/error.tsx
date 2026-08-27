"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  LuRefreshCw,
  LuLayoutDashboard,
  LuTerminal,
  LuCopy,
  LuCheck,
  LuBug,
  LuShieldAlert,
} from "react-icons/lu";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("Critical Runtime Failure:", error);
  }, [error]);

  const handleCopyLog = () => {
    const errorText = `[CRITICAL_CORE_PANIC]\nDigest: ${error?.digest || "N/A"}\nMessage: ${error?.message || "Unknown Runtime Failure"}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B0F19] px-4 py-16 text-[#FAFAFA] selection:bg-[#CEFF1F] selection:text-black">
      {/* Background Glow Mesh */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-[#CEFF1F]/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[400px] w-[550px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-[140px]" />

      {/* Cyber Grid Background Lines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#2A3143_1px,transparent_1px),linear-gradient(to_bottom,#2A3143_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="container relative z-10 mx-auto max-w-2xl text-center">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 backdrop-blur-md"
        >
          <LuShieldAlert className="size-4 animate-pulse text-rose-400" />
          <span>Kernel Execution Interrupted</span>
        </motion.div>

        {/* Error Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="font-poppins text-4xl font-extrabold tracking-tight sm:text-6xl text-white"
        >
          State Pipeline{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-white">
            Unreachable
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-[#8B95A5] leading-relaxed"
        >
          An unexpected runtime anomaly broke the active thread. The AI Learning
          OS has locked this sub-routine to preserve your session integrity.
        </motion.p>

        {/* Terminal Style Error Diagnostics Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 overflow-hidden rounded-2xl border border-[#2A3143] bg-[#131824]/90 text-left font-mono text-xs shadow-[0_0_35px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between border-b border-[#2A3143] bg-[#1A202F]/80 px-4 py-3">
            <div className="flex items-center gap-2 text-[#8B95A5]">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#CEFF1F]/80" />
              <div className="ml-2 flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                <LuTerminal className="size-3.5 text-[#CEFF1F]" />
                <span>debug_trace.log</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {error?.digest && (
                <span className="hidden sm:inline-block text-[10px] text-[#8B95A5] bg-[#0B0F19] px-2 py-0.5 rounded border border-[#2A3143]">
                  DIGEST: {error.digest.slice(0, 10)}
                </span>
              )}
              <button
                onClick={handleCopyLog}
                className="flex items-center gap-1 rounded bg-[#131824] px-2 py-1 text-[10px] text-slate-300 hover:text-[#CEFF1F] border border-[#2A3143] hover:border-[#CEFF1F]/40 transition-colors"
                title="Copy Trace"
              >
                {copied ? (
                  <>
                    <LuCheck className="size-3 text-[#CEFF1F]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <LuCopy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Code Body */}
          <div className="p-4 space-y-2 text-rose-300/90 leading-relaxed max-h-36 overflow-y-auto">
            <div className="flex items-center gap-2 text-[11px] text-[#8B95A5]">
              <LuBug className="size-3.5 text-rose-400" />
              <span>[EXCEPTION_ORIGIN]: Client-Side Hydration & State Flow</span>
            </div>
            <p className="break-all font-mono text-[11px] bg-[#0B0F19]/60 p-2.5 rounded-lg border border-rose-500/20 text-rose-400">
              {error?.message || "Critical runtime failure occurred during view execution."}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary Action Button (Neon Style) */}
          <button
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#CEFF1F] px-7 py-3.5 text-sm font-bold text-[#0B0F19] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_25px_rgba(206,255,31,0.35)] active:scale-95 cursor-pointer"
          >
            <LuRefreshCw className="size-4" />
            <span>Re-compile & Retry</span>
          </button>

          {/* Secondary Action Button */}
          <Link
            href="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#2A3143] bg-[#131824] px-7 py-3.5 text-sm font-semibold text-[#FAFAFA] transition-all duration-200 hover:border-[#CEFF1F]/50 hover:bg-[#1A202F] active:scale-95"
          >
            <LuLayoutDashboard className="size-4 text-[#CEFF1F]" />
            <span>Return to Control Center</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}