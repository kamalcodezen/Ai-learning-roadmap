"use client";

import {
  Sparkles,
  SearchCheck,
  Route,
  Brain,
  ClipboardCheck,
  CodeXml,
  BadgeCheck,
  Target,
} from "lucide-react";
import { MarqueeAnimation } from "@/src/components/ui/marquee-animation";

const MARQUEE_ITEMS = [
  {
    id: "career-analysis",
    label: "AI Career Analysis",
    icon: Sparkles,
  },
  {
    id: "skill-gap",
    label: "Skill Gap Diagnosis",
    icon: SearchCheck,
  },
  {
    id: "personalized-roadmaps",
    label: "Personalized Roadmaps",
    icon: Route,
  },
  {
    id: "adaptive-learning",
    label: "Adaptive Learning",
    icon: Brain,
  },
  {
    id: "practical-assessments",
    label: "Practical Assessments",
    icon: ClipboardCheck,
  },
  {
    id: "real-world-projects",
    label: "Real-World Projects",
    icon: CodeXml,
  },
  {
    id: "skill-mastery",
    label: "Skill Mastery",
    icon: BadgeCheck,
  },
  {
    id: "career-readiness",
    label: "Career Readiness",
    icon: Target,
  },
];

export default function ProgressBridgeSection() {
  return (
    <section
      aria-label="AI Pather Core Capabilities"
      className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-3 sm:py-4 md:py-5 shadow-[0_6px_32px_rgba(159,84,247,0.3)] transition-colors dark:shadow-[0_6px_32px_rgba(185,120,255,0.25)]"
    >
      {/* Left and right soft edge gradients for smooth entry and exit */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-44 bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-44 bg-gradient-to-l from-[var(--color-secondary)] to-transparent" />

      {/* Single Continuous Horizontal Marquee */}
      <MarqueeAnimation
        direction="left"
        baseVelocity={-1}
        pauseOnHover={false}
        className="py-1"
      >
        {MARQUEE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center">
              {/* Extra Large Item: Icon + Label with Hover Zoom Effect */}
              <div className="group/item flex cursor-pointer items-center gap-3.5 text-white transition-all duration-300 ease-out hover:scale-105 sm:hover:scale-110 sm:gap-4.5">
                <Icon
                  className="size-7 shrink-0 text-white/95 transition-all duration-300 ease-out group-hover/item:scale-115 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] sm:size-8 md:size-9"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap font-sans text-xl font-bold tracking-tight text-white drop-shadow-sm transition-all duration-300 ease-out group-hover/item:text-white group-hover/item:drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] sm:text-2xl md:text-3xl">
                  {item.label}
                </span>
              </div>

              {/* Glowing Dot Separator */}
              <span
                className="mx-8 flex items-center justify-center sm:mx-12 md:mx-14"
                aria-hidden="true"
              >
                <span className="size-2.5 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.95)] sm:size-3" />
              </span>
            </div>
          );
        })}
      </MarqueeAnimation>
    </section>
  );
}
