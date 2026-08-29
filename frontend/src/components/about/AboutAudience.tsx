"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiUsers,
  FiRepeat,
  FiCompass,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const audiences = [
  {
    category: "Career Switchers",
    headline: "Transition Without Wasted Cycles",
    description:
      "People trying to move into a new career without wasting months learning the wrong things.",
    icon: FiRepeat,
    badge: "Targeted Shift",
    keyBenefits: [
      "Translates existing domain expertise",
      "Skips irrelevant introductory bloat",
      "Validates target JD prerequisite gates",
    ],
    accent: "from-purple-500/10 to-indigo-500/5",
    iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    category: "Self-Learners",
    headline: "Clarity Over Infinite Playlists",
    description:
      "People overwhelmed by endless resources who need direction rather than another playlist.",
    icon: FiCompass,
    badge: "Resource Distillation",
    keyBenefits: [
      "Curated critical path milestones",
      "Active project challenges over videos",
      "Continuous verification checkpoints",
    ],
    accent: "from-blue-500/10 to-cyan-500/5",
    iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    category: "Growing Professionals",
    headline: "Continuous Edge & Gap Resolution",
    description:
      "People who already have skills but need to identify gaps and continuously evolve.",
    icon: FiTrendingUp,
    badge: "Senior Mastery",
    keyBenefits: [
      "Diagnostic blind-spot isolation",
      "Advanced architectural depth",
      "Anti-decay cognitive retention",
    ],
    accent: "from-emerald-500/10 to-teal-500/5",
    iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
];

export default function AboutAudience() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="section-pad relative w-full overflow-hidden bg-background/50 transition-colors duration-300">
      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
            <FiUsers className="size-3.5 text-primary" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Who We&apos;re Building For
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Built for people who are{" "}
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              serious about becoming capable
            </span>
          </h2>

          <p className="mt-4 font-poppins text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Whether pivoting industries or leveling up technical depth, AI
            Pather eliminates noise and optimizes your trajectory
          </p>
        </div>

        {/* 3 Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {audiences.map((aud, index) => {
            const Icon = aud.icon;

            return (
              <motion.div
                key={aud.category}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-5">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl border ${aud.iconBg}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground uppercase px-2.5 py-0.5 rounded-full bg-muted border border-border/80">
                      {aud.badge}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                    {aud.category}
                  </span>

                  <h3 className="mt-1 font-poppins text-lg sm:text-xl font-bold text-foreground">
                    {aud.headline}
                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {aud.description}
                  </p>
                </div>

                {/* Key Benefits Checklist */}
                <div className="mt-6 pt-5 border-t border-border/70">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                    Core Advantage
                  </span>
                  <ul className="space-y-2">
                    {aud.keyBenefits.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-foreground/80 font-medium"
                      >
                        <FiCheckCircle className="size-3.5 text-primary shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
