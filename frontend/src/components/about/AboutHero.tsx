"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { FiArrowUpRight, FiLayers, FiCompass, FiShield } from "react-icons/fi";
import CapabilitySkillGraph from "./CapabilitySkillGraph";
import Link from "next/link";

export default function AboutHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                About AI Pather
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              We believe learning should{" "}
              <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
                lead somewhere
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="mt-6 font-poppins text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              AI Pather exists to help people turn scattered learning into a
              clear, adaptive path toward real career capability.
            </p>

            {/* Capability Feature Pills */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 backdrop-blur-sm">
                <FiCompass className="size-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Adaptive Trajectory
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 backdrop-blur-sm">
                <FiLayers className="size-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Skill-Gap Diagnosis
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3.5 py-2.5 backdrop-blur-sm">
                <FiShield className="size-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Zero-Clone Proof
                </span>
              </div>
            </div>

            {/* Quick Action Link */}
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 text-sm font-semibold !text-white"
              >
                <span>Explore The System</span>
                <FiArrowUpRight className="size-4" />
              </Link>
              <a
                href="#the-problem"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Why We Built This ↓
              </a>
            </div>
          </motion.div>

          {/* Right Column: Interactive Product Visual */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            <CapabilitySkillGraph />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
