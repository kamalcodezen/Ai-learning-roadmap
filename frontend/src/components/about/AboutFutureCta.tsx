"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { FiZap } from "react-icons/fi";
import Button from "@/src/components/ui/button";

export default function AboutFutureCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden section-pad pb-24 sm:pb-28">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.03] -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-6xl rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/10 p-8 sm:p-14 lg:p-20 text-center shadow-2xl overflow-hidden"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-8">
            <FiZap className="size-3.5 text-primary" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              The Long-Term Vision
            </span>
          </div>

          {/* Core Impact Headlines */}
          <h2 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance max-w-6xl mx-auto">
            “The goal isn&apos;t to help you learn more{" "}
            <span className="block mt-2 bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              It&apos;s to help you become more capable“
            </span>
          </h2>

          {/* Supporting Copy */}
          <p className="mt-5 font-poppins text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            We&apos;re building AI Pather toward a future where career development is continuous,
            <br className="hidden sm:inline" />{" "}
            personalized, evidence-driven, and adaptable to real life.
          </p>

          {/* CTA Action Area */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              text="Build My Career Path"
              href="/signup"
              className="font-poppins"
            />
          </div>

          {/* System Assurance Badges */}
          <div className="mt-5 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Evidence-Driven</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span>Skill-Gap Aware</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>100% Adaptive</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
