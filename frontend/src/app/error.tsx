"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  LuTriangleAlert,
  LuRefreshCw,
  LuHouse,
  LuTerminal,
} from "react-icons/lu";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unhandled Runtime Error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      {/* ব্যাকগ্রাউন্ড রেডিয়াল লাইট ইফেক্ট */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[450px] -translate-x-1/2 rounded-full bg-rose-500/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto max-w-xl text-center">
        {/* টপ ব্যাজ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-mono text-rose-400"
        >
          <LuTriangleAlert className="size-3.5" />
          <span>System Execution Interrupted</span>
        </motion.div>

        {/* এরর কোড ও শিরোনাম */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="font-poppins text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Something went{" "}
          <i className="font-serif italic font-normal text-slate-400">
            off track
          </i>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-md text-sm sm:text-base text-slate-400"
        >
          একটি অপ্রত্যাশিত সমস্যার কারণে স্টেট লোড হতে পারেনি। আমাদের AI
          সেলফ-হিলিং রিকভারি দিয়ে পুনরায় চেষ্টা করুন।
        </motion.p>

        {/* এরর ডিটেইলস কার্ড (Terminal Style) */}
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-surface text-left font-mono text-xs shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
              <div className="flex items-center gap-2 text-slate-400">
                <LuTerminal className="size-3.5 text-[var(--color-primary)]" />
                <span>runtime_trace.log</span>
              </div>
              {error.digest && (
                <span className="text-[10px] text-slate-500">
                  ID: {error.digest.slice(0, 8)}
                </span>
              )}
            </div>
            <div className="p-4 text-rose-400/90 break-words leading-relaxed max-h-32 overflow-y-auto">
              {error.message}
            </div>
          </motion.div>
        )}

        {/* অ্যাকশন বাটনসমূহ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <button
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-secondary)] hover:shadow-[0_0_20px_rgba(159,84,247,0.25)] active:scale-95"
          >
            <LuRefreshCw className="size-4" />
            <span>Try Re-executing</span>
          </button>

          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LuHouse className="size-4" />
            <span>Return to Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
