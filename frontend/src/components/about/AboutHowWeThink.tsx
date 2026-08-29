"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiTarget,
  FiUnlock,
  FiAward,
  FiRefreshCw,
  FiArrowRight,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import { BorderBeam } from "@/src/components/ui/border-beam";

const workflowCards = [
  {
    step: "01",
    phase: "DIAGNOSE",
    title: "Skill-Gap Baseline",
    description:
      "Understand where you are and identify the gaps between your current skills and your target career.",
    highlight: "Zero Guesswork",
    metrics: [
      "Current capability audit",
      "Target role vector matching",
      "Prerequisite deficiency alerts",
    ],
    icon: FiTarget,
    gradient: "from-blue-500/10 to-indigo-500/5",
    accentColor: "text-blue-500",
    borderColor: "border-blue-500/20",
    beamColorFrom: "#3B82F6",
    beamColorTo: "#6366F1",
  },
  {
    step: "02",
    phase: "UNBLOCK",
    title: "Targeted Foundations",
    description:
      "Find the foundational knowledge and prerequisites you need before moving forward.",
    highlight: "Precise Prerequisites",
    metrics: [
      "Micro-concept resolution",
      "Context-aware scaffolding",
      "Blind-spot elimination",
    ],
    icon: FiUnlock,
    gradient: "from-purple-500/10 to-pink-500/5",
    accentColor: "text-purple-500",
    borderColor: "border-purple-500/20",
    beamColorFrom: "#9F54F7",
    beamColorTo: "#EC4899",
  },
  {
    step: "03",
    phase: "PROVE",
    title: "Demonstrated Evidence",
    description:
      "Turn learning into projects, challenges, and evidence that demonstrates actual capability.",
    highlight: "Zero-Clone Portfolio",
    metrics: [
      "Autonomous project builds",
      "Live edge-case debugging",
      "Tamper-proof capability logs",
    ],
    icon: FiAward,
    gradient: "from-emerald-500/10 to-teal-500/5",
    accentColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    beamColorFrom: "#10B981",
    beamColorTo: "#14B8A6",
  },
  {
    step: "04",
    phase: "ADAPT",
    title: "Continuous Evolution",
    description:
      "Let your roadmap evolve as your skills, goals, available time, and progress change.",
    highlight: "Dynamic Realignment",
    metrics: [
      "Pacing & schedule adjustment",
      "Evolving industry requirements",
      "Anti-decay retention memory",
    ],
    icon: FiRefreshCw,
    gradient: "from-amber-500/10 to-orange-500/5",
    accentColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    beamColorFrom: "#F59E0B",
    beamColorTo: "#F97316",
  },
];

export default function AboutHowWeThink() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="section-pad relative w-full overflow-hidden bg-background/50 transition-colors duration-300">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
            <FiActivity className="size-3.5 text-primary" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              How We Think
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            The closed-loop architecture for{" "}
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              career mastery
            </span>
          </h2>

          <p className="mt-4 font-poppins text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Traditional roadmaps are static checklists. AI Pather operates as a
            continuous diagnostic engine that actively guides, verifies, and
            adapts.
          </p>
        </div>

        {/* 4 Bento Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {workflowCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.step}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`
                  relative flex flex-col justify-between rounded-2xl border ${card.borderColor} bg-card p-6 shadow-md overflow-hidden
                `}
              >
                {/* Active Dynamic Border Beam matching card accent color */}
                <BorderBeam
                  size={190}
                  duration={7}
                  delay={0}
                  colorFrom={card.beamColorFrom}
                  colorTo={card.beamColorTo}
                />

                <div>
                  {/* Top Step + Phase */}
                  <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                    <span className="font-mono text-xl font-extrabold text-foreground/70">
                      {card.step}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted ${card.accentColor}`}
                    >
                      <span>{card.phase}</span>
                    </div>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex size-9 items-center justify-center rounded-lg bg-muted border border-border/60 ${card.accentColor}`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      {card.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Sub-Metrics Checklist */}
                <div className="mt-6 pt-4 border-t border-border/60">
                  <ul className="space-y-1.5 text-[11px] sm:text-xs text-muted-foreground font-mono">
                    {card.metrics.map((m, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <FiCheckCircle className={`size-3 shrink-0 ${card.accentColor}`} />
                        <span className="truncate">{m}</span>
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
