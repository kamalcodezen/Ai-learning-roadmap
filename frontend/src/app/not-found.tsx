"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { LuArrowLeft, LuArrowUpRight } from "react-icons/lu";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Error 404
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              The page you&apos;re looking for is{" "}
              <span className="text-muted-foreground">somewhere else.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              This route could not be found. It may have been moved, removed, or
              the address may be incorrect.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Return Home
                <LuArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
              >
                <LuArrowLeft className="size-4" />
                Go Back
              </button>
            </div>
          </motion.div>

          {/* Right 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="select-none"
          >
            <div className="font-mono text-[clamp(8rem,20vw,15rem)] font-bold leading-none tracking-[-0.1em] text-muted-foreground/10">
              404
            </div>
          </motion.div>
        </div>

        {/* Bottom Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 origin-left border-t border-border"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex items-center justify-between"
        >
          <span className="text-xs font-medium text-muted-foreground">
            AI Pather
          </span>

          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
            Page Not Found
          </span>
        </motion.div>
      </div>
    </main>
  );
}
