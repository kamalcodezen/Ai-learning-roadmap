"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiAlertTriangle,
  FiArrowDown,
  FiXCircle,
  FiCheckCircle,
  } from "react-icons/fi";
import { BorderBeam } from "@/src/components/ui/border-beam";

export default function AboutProblem() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="the-problem"
      className="section-pad relative w-full overflow-hidden bg-background/50 transition-colors duration-300"
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
            <FiAlertTriangle className="size-3.5 text-red-500" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-red-500">
              The Problem
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            The internet gave us more to learn.{" "}
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              Not a better way to learn
            </span>
          </h2>

          <div className="mt-6 space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance max-w-4xl mx-auto">
            <p>
              Thousands of courses and tutorials exist, but more content doesn&apos;t mean better learning. Most learning paths are static—they don&apos;t understand your skills, gaps, goals, or changing circumstances
            </p>
            <p className="font-medium text-foreground/90">
              People consume more, collect certificates, yet still wonder if they&apos;re job-ready.
            </p>
          </div>
        </div>

        {/* Visual Contrast Grid: The Linear Trap vs The Capability System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* LEFT: The Static Tutorial Trap (Broken Waterfall) */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 relative rounded-2xl border border-red-500/20 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <FiXCircle className="size-5 text-red-500" />
                  <h3 className="font-poppins text-lg font-bold text-foreground">
                    The Static Trap
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-red-500 uppercase px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                  Broken Cycle
                </span>
              </div>

              {/* The 4-step broken waterfall */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-muted-foreground">01</span>
                    <span className="text-sm font-semibold text-foreground">
                      MORE CONTENT
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Endless playlists</span>
                </div>

                <div className="flex justify-center py-1">
                  <FiArrowDown className="size-4 text-muted-foreground/60 animate-bounce" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-muted-foreground">02</span>
                    <span className="text-sm font-semibold text-foreground">
                      MORE COMPLETION
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">100% video watched</span>
                </div>

                <div className="flex justify-center py-1">
                  <FiArrowDown className="size-4 text-muted-foreground/60 animate-bounce" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-red-500">03</span>
                    <span className="text-sm font-semibold text-red-500">
                      MORE CONFUSION
                    </span>
                  </div>
                  <span className="text-xs text-red-400">Tutorial lock-in</span>
                </div>
              </div>
            </div>

            {/* Bottom inequality callout */}
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-red-400 font-bold">
                Fatal Flaw
              </div>
              <div className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                ≠ MORE CAPABILITY
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Passive consumption doesn&apos;t translate to job readiness.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: The AI Pather Adaptive Capability Engine */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 relative rounded-2xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-hidden"
          >
            <BorderBeam size={220} duration={7} colorFrom="#9F54F7" colorTo="#38BDF8" />

            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="size-5 text-primary" />
                  <h3 className="font-poppins text-lg font-bold text-foreground">
                    The Adaptive Solution
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-primary uppercase px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30">
                  AI Pather System
                </span>
              </div>

              {/* The 4-step capability engine */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-primary">01</span>
                    <span className="text-sm font-semibold text-foreground">
                      DIAGNOSE GAPS
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium">Target baseline</span>
                </div>

                <div className="flex justify-center py-1">
                  <FiArrowDown className="size-4 text-primary/70" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-primary">02</span>
                    <span className="text-sm font-semibold text-foreground">
                      ADAPTIVE ROADMAP
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium">Dynamic updates</span>
                </div>

                <div className="flex justify-center py-1">
                  <FiArrowDown className="size-4 text-primary/70" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-500">03</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      ZERO-CLONE PROOF
                    </span>
                  </div>
                  <span className="text-xs text-emerald-500 font-medium">Real capability</span>
                </div>
              </div>
            </div>

            {/* Bottom verified capability callout */}
            <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                Proven Outcome
              </div>
              <div className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                = VERIFIED CAREER CAPABILITY
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Evidence-based milestones that employers validate.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
