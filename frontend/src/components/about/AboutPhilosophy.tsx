"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiX,
  FiCheck,
  FiCompass,
  FiLayers,
  FiCode,
  FiRefreshCw,
  FiSlash,
  FiCpu,
  FiAward,
  FiSliders,
} from "react-icons/fi";
import { BorderBeam } from "@/src/components/ui/border-beam";

const rejectList = [
  {
    title: "Static Roadmaps",
    desc: "Rigid one-size-fits-all checklists that treat absolute beginners and experienced engineers identically.",
    icon: FiSlash,
  },
  {
    title: "Endless Content Consumption",
    desc: "Hoarding course playlists, video lectures, and certificates without building scalable production systems.",
    icon: FiLayers,
  },
  {
    title: "Completion as Success Metric",
    desc: "Treating 100% video completion or quiz checkboxes as proof of professional engineering capability.",
    icon: FiAward,
  },
  {
    title: "Passive Learning",
    desc: "Copying code line-by-line without understanding debugging, error handling, or trade-off analysis.",
    icon: FiCode,
  },
];

const believeList = [
  {
    title: "Personal Context",
    desc: "Starting precisely from what you already understand and targeting your unique career goal.",
    icon: FiCompass,
  },
  {
    title: "Skill-Gap Awareness",
    desc: "Pinpointing the exact missing prerequisites and focus areas needed for job-readiness.",
    icon: FiCpu,
  },
  {
    title: "Proof of Work",
    desc: "Generating verifiable zero-clone portfolio evidence that proves real architectural capability.",
    icon: FiCode,
  },
  {
    title: "Adaptive Progress",
    desc: "Dynamic milestones that recalibrate as your skills evolve, projects ship, and schedules shift.",
    icon: FiRefreshCw,
  },
];

export default function AboutPhilosophy() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="section-pad relative w-full overflow-hidden">
      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
            <FiSliders className="size-3.5 text-primary" />
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Our Philosophy
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            What we stand against{" "}
            <span className="bg-linear-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              What we stand for
            </span>
          </h2>

          <p className="mt-4 font-poppins text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            We are redefining career learning from passive consumption into
            an active, verifiable engineering standard.
          </p>
        </div>

        {/* Dual Comparison Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          {/* WE DON'T BELIEVE IN */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-red-500/20 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    <FiX className="size-5" />
                  </div>
                  <h3 className="font-poppins text-lg sm:text-xl font-bold text-foreground">
                    WE DON&apos;T BELIEVE IN
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-red-400 uppercase px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                  Legacy Paradigm
                </span>
              </div>

              <div className="space-y-4">
                {rejectList.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors hover:border-red-500/30"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-500 mt-0.5">
                      <FiX className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 font-mono text-xs text-red-400 text-center">
              Status: Deprecated Methodology
            </div>
          </motion.div>

          {/* WE BELIEVE IN */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative rounded-2xl border border-primary/40 bg-gradient-to-b from-card via-card to-primary/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl overflow-hidden"
          >
            <BorderBeam size={250} duration={8} colorFrom="#9F54F7" colorTo="#22C55E" />

            <div>
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <FiCheck className="size-5" />
                  </div>
                  <h3 className="font-poppins text-lg sm:text-xl font-bold text-foreground">
                    WE BELIEVE IN
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-primary uppercase px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30">
                  AI Pather Standard
                </span>
              </div>

              <div className="space-y-4">
                {believeList.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary mt-0.5">
                      <FiCheck className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 font-mono text-xs text-primary font-semibold text-center">
              Status: Verified Capability Engine
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
