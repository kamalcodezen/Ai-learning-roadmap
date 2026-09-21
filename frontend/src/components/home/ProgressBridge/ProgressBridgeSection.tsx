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
    <div className="relative w-full overflow-visible z-20">
      {/* ============================= NETFLIX-STYLE CURVED TOP ARC ============================= */}
      <div className="relative w-full overflow-hidden leading-none pointer-events-none -mb-[1px]">
        {/* Ambient subtle purple glow behind the apex peak */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-12 w-3/4 max-w-4xl rounded-full bg-purple-500/10 blur-xl" />

        <svg
          viewBox="0 0 1440 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 sm:h-12 md:h-16 lg:h-18 block object-fill"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Multi-stop pure brand purple glowing stroke (no red/pink) */}
            <linearGradient id="netflixNeonStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9F54F7" stopOpacity="0" />
              <stop offset="20%" stopColor="#9F54F7" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#A855F7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#D8B4FE" stopOpacity="1" />
              <stop offset="65%" stopColor="#A855F7" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#9F54F7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#9F54F7" stopOpacity="0" />
            </linearGradient>

            {/* Seamless gradient fill matching marquee body */}
            <linearGradient id="netflixArcFill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>

            {/* Soft luminous glow aura */}
            <filter id="neonGlowFilter" x="-10%" y="-30%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Solid base fill connecting seamlessly to marquee */}
          <path
            d="M0,70 Q720,4 1440,70 L1440,70 L0,70 Z"
            fill="url(#netflixArcFill)"
          />

          {/* Primary glowing neon arc line */}
          <path
            d="M0,70 Q720,4 1440,70"
            stroke="url(#netflixNeonStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            filter="url(#neonGlowFilter)"
          />
        </svg>
      </div>

      {/* ============================= MARQUEE BODY ============================= */}
      <section
        aria-label="AI Pather Core Capabilities"
        className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-2.5 sm:py-3.5 shadow-[0_10px_36px_rgba(159,84,247,0.35)] transition-colors dark:shadow-[0_10px_36px_rgba(185,120,255,0.3)]"
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
                {/* Item: Icon + Label with Hover Zoom Effect */}
                <div className="group/item flex cursor-pointer items-center gap-3.5 text-white transition-all duration-700 ease-out hover:scale-105 sm:hover:scale-110 sm:gap-4.5">
                  <Icon
                    className="size-6 shrink-0 text-white/95 transition-all duration-300 ease-out group-hover/item:scale-115 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] sm:size-5"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap font-sans text-lg font-bold tracking-tight text-white drop-shadow-sm transition-all duration-300 ease-out group-hover/item:text-white group-hover/item:drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] sm:text-xl md:text-xl">
                    {item.label}
                  </span>
                </div>

                {/* Glowing Dot Separator */}
                <span
                  className="mx-6 flex items-center justify-center sm:mx-10 md:mx-12"
                  aria-hidden="true"
                >
                  <span className="size-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.95)] sm:size-2.5" />
                </span>
              </div>
            );
          })}
        </MarqueeAnimation>
      </section>
    </div>
  );
}
