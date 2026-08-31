"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiCode,
  FiCpu,
  FiMessageSquare,
  FiCheckCircle,
  FiAward,
  FiArrowRight,
  FiTerminal,
  } from "react-icons/fi";

const pillars = [
  {
    id: "build",
    number: "01",
    tag: "BUILD",
    title: "Production Systems Over Tutorials",
    shortDesc: "Real-world engineering instead of copy-pasting boilerplate exercises.",
    fullDesc:
      "Capability begins when you leave tutorial islands behind. AI Pather evaluates your ability to build architecturally sound systems with modularity, scalability, and resilience.",
    icon: FiCode,
    metric: "Zero Boilerplate",
    badge: "Active Construction",
    preview: {
      label: "Architecture Standard",
      item1: "End-to-end full-stack workflows",
      item2: "Multi-layered state & data contracts",
      item3: "Production-ready error recovery",
    },
  },
  {
    id: "solve",
    number: "02",
    tag: "SOLVE",
    title: "Unrehearsed Problem Solving",
    shortDesc: "Debugging unknown failures and handling complex edge cases.",
    fullDesc:
      "When something breaks in production, there is no video tutorial. We measure your capacity to isolate root causes, analyze stack traces, and optimize latency under constraints.",
    icon: FiCpu,
    metric: "Dynamic Challenges",
    badge: "Algorithmic Reasoning",
    preview: {
      label: "Diagnostic Vector",
      item1: "Live debugging scenarios",
      item2: "Edge-case stress testing",
      item3: "System bottleneck mitigation",
    },
  },
  {
    id: "explain",
    number: "03",
    tag: "EXPLAIN",
    title: "Architectural Articulation",
    shortDesc: "Defending technical decisions and understanding core trade-offs.",
    fullDesc:
      "Senior engineers are defined by their judgment. Can you explain why you chose one database over another, or how your system handles eventual consistency? We verify your technical depth.",
    icon: FiMessageSquare,
    metric: "Conceptual Mastery",
    badge: "Trade-off Defense",
    preview: {
      label: "Mastery Evaluation",
      item1: "System design rationale",
      item2: "Latency vs throughput trade-offs",
      item3: "Security & governance posture",
    },
  },
  {
    id: "prove",
    number: "04",
    tag: "PROVE",
    title: "Zero-Clone Evidence",
    shortDesc: "A verifiable portfolio graph that employers can validate instantly.",
    fullDesc:
      "No generic todo apps or cloned repo forks. AI Pather generates immutable proof of work tied directly to targeted industry Job Descriptions and engineering competency rubrics.",
    icon: FiCheckCircle,
    metric: "Verifiable Graph",
    badge: "Zero-Clone Certified",
    preview: {
      label: "Evidence Protocol",
      item1: "Tamper-proof capability logs",
      item2: "JD reality-gate matching",
      item3: "Live interactive project showcase",
    },
  },
];

export default function AboutBelief() {
  const [activePillar, setActivePillar] = useState(pillars[0]);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="section-pad relative w-full overflow-hidden">
      {/* Radial Gradient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Main Statement Banner */}
        <div className="mx-auto max-w-5xl text-center mb-10 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-6">
            <FiAward className="size-3.5 text-primary" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Our Core Belief
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight text-balance">
            “Knowledge is only the beginning.{" "}
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              Capability is the goal
            </span>”
          </h2>

          <p className="mt-6 font-poppins text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-5xl mx-auto">
            We believe career learning should be measured by what
            <br className="hidden sm:inline" />{" "}
            you can actually do—not simply by how many lessons you&apos;ve completed.
          </p>
        </div>

        {/* 4 Proof Pillars Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-6xl mx-auto">
          {/* Left Column: Pillar Navigation Cards */}
          <div className="lg:col-span-6 space-y-3.5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activePillar.id === pillar.id;

              return (
                <motion.button
                  key={pillar.id}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                  onClick={() => setActivePillar(pillar)}
                  className={`
                    w-full text-left rounded-2xl p-4 sm:p-5 transition-all duration-300 flex items-start gap-4 border
                    ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-[0_4px_25px_rgba(159,84,247,0.15)] ring-1 ring-primary/40"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-card-soft"
                    }
                  `}
                >
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isActive
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {pillar.number}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-bold text-foreground truncate">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {pillar.shortDesc}
                    </p>
                  </div>

                  <FiArrowRight
                    className={`size-4 shrink-0 mt-2 transition-transform duration-300 ${
                      isActive
                        ? "text-primary translate-x-1"
                        : "text-muted-foreground opacity-40"
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Deep Dive Showcase */}
          <div className="lg:col-span-6">
            <motion.div
              key={activePillar.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden"
            >
              {/* Pillar Header */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {React.createElement(activePillar.icon, { className: "size-4" })}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                      Proof Pillar {activePillar.number}
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {activePillar.tag} Matrix
                    </h4>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {activePillar.badge}
                </span>
              </div>

              {/* Title & Full Description */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                {activePillar.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {activePillar.fullDesc}
              </p>

              {/* Architecture Protocol Breakdown */}
              <div className="mt-6 rounded-xl border border-border/80 bg-card-soft p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiTerminal className="size-4 text-primary" />
                  <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
                    {activePillar.preview.label}
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span>{activePillar.preview.item1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span>{activePillar.preview.item2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span>{activePillar.preview.item3}</span>
                  </li>
                </ul>
              </div>

              {/* Live Metric Tag */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/60 font-mono text-xs text-muted-foreground">
                <span>Verification Rigor</span>
                <span className="font-bold text-foreground">
                  {activePillar.metric}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
