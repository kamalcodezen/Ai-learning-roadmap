"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { FiMail, FiClock, FiShield, FiCpu } from "react-icons/fi";

export default function ContactHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden pt-32 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="global-pos px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        {/* Eyebrow Badge */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Contact AI Pather
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
        >
          Let&apos;s build your career capability,{" "}
          <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
            together
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 font-poppins text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance"
        >
          Have questions about adaptive trajectories, diagnostic skill isolation,
          or enterprise capability benchmarks? We&apos;re here to help.
        </motion.p>

        {/* System Status / Assurance Badges */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2 backdrop-blur-sm">
            <FiClock className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground/90">Avg Response &lt; 24h</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2 backdrop-blur-sm">
            <FiCpu className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground/90">24/7 AI Engine Online</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2 backdrop-blur-sm">
            <FiShield className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground/90">Direct Team &amp; Mentorship</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
