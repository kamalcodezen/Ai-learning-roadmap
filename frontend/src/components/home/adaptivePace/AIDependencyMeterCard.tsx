"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Scale, Sparkles, Terminal, FileCode2, UserCheck2 } from "lucide-react";
import { getAIDependency, AIDependencyResult } from "@/src/lib/api/learner/adaptive-recovery";

interface Persona {
  id: string;
  label: string;
  score: number;
  pillars: {
    prompt: number; // max 100
    ownership: number;
    interview: number;
  };
  verdict: string;
  badge: string;
  badgeColor: string;
  advice: string;
}

const PERSONAS: Persona[] = [
  {
    id: "independent",
    label: "Independent Solver",
    score: 22,
    pillars: {
      prompt: 15,
      ownership: 90,
      interview: 88,
    },
    verdict: "Outstanding Self-Reliance! You think through logic before consulting AI.",
    badge: "Independent Problem Solver (0%–30%)",
    badgeColor: "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30",
    advice: "Your chance of clearing live whiteboard coding rounds and FAANG technical screenings is at the highest percentile.",
  },
  {
    id: "balanced",
    label: "Balanced Collaborator",
    score: 48,
    pillars: {
      prompt: 45,
      ownership: 72,
      interview: 68,
    },
    verdict: "Healthy AI Augmentation! You use AI to boost productivity while understanding core foundations.",
    badge: "Balanced AI Augmentation (31%–65%)",
    badgeColor: "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30",
    advice: "Continue challenging yourself on algorithm design without copilot suggestions before implementing solutions.",
  },
  {
    id: "reliant",
    label: "High AI Reliance",
    score: 82,
    pillars: {
      prompt: 92,
      ownership: 32,
      interview: 35,
    },
    verdict: "High AI Reliance Alert! Heavy reliance on code copy-pasting detected.",
    badge: "High AI Reliance Alert (66%–100%)",
    badgeColor: "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30",
    advice: "Warning: Live whiteboard interviews don't allow AI. Action Tip: Solve the next milestone without Copilot prompts to build mental muscle memory.",
  },
];

export default function AIDependencyMeterCard() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("balanced");
  const [liveData, setLiveData] = useState<AIDependencyResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAIDependency()
      .then((data) => {
        if (isMounted && data && data.score) {
          setLiveData(data);
        }
      })
      .catch(() => {
        // graceful fallback to interactive profiles
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[1];
  
  // Use live data if user hasn't overridden via simulation buttons
  const score = liveData && selectedPersonaId === "balanced" ? liveData.score : currentPersona.score;
  const pillars = liveData && selectedPersonaId === "balanced"
    ? {
        prompt: liveData.pillars.promptDelegation,
        ownership: liveData.pillars.codeOwnership,
        interview: liveData.pillars.liveProblemSolving,
      }
    : currentPersona.pillars;
  const verdict = liveData && selectedPersonaId === "balanced" ? liveData.verdict : currentPersona.verdict;
  const badge = liveData && selectedPersonaId === "balanced" ? liveData.badge : currentPersona.badge;
  const badgeColor = currentPersona.badgeColor;
  const advice = liveData && selectedPersonaId === "balanced" ? liveData.advice : currentPersona.advice;

  // Gauge calculation
  const clampedScore = Math.max(2, Math.min(100, score));

  return (
    <div className="dashboard-card w-full rounded-lg p-4 sm:p-8 lg:p-10 transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/60">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-md shadow-purple-500/20">
            <Scale className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Feature 03
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs sm:text-base font-medium text-muted-foreground">Whiteboard Readiness</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-foreground">
              AI Dependency & Problem-Solving Meter
            </h3>
          </div>
        </div>

        {/* Live Classification Badge in Primary Brand Palette */}
        <div className={`self-start lg:self-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-xs sm:text-base font-semibold ${badgeColor}`}>
          {badge}
        </div>
      </div>

      {/* Interactive Profile Persona Selector */}
      <div className="mt-5 sm:mt-6 flex flex-col md:flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-2 text-xs sm:text-base font-semibold text-muted-foreground">
          <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--color-primary)] shrink-0" />
          <span>Simulate Learner Profile:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
          {PERSONAS.map((p) => {
            const isActive = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                type="button"
                suppressHydrationWarning
                onClick={() => setSelectedPersonaId(p.id)}
                className={`py-2 px-2 sm:py-2 sm:px-3 rounded-lg text-xs sm:text-sm lg:text-base font-medium text-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 border border-border/70 hover:border-[var(--color-primary)]/40 text-foreground/80"
                }`}
              >
                <span>{p.label}</span>{" "}
                <span className="text-[10px] sm:text-xs opacity-80">({p.score}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visual Gauge + 3 Pillars */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left: Animated Radial Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border border-border/80 bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff]/50 dark:from-[#150727] dark:to-[#0a0015] shadow-inner">
          <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">
            AI Dependency Index
          </span>

          {/* SVG Gauge */}
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="aiGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary, #8523F5)" />
                  <stop offset="100%" stopColor="var(--color-primary, #9F54F7)" />
                </linearGradient>
              </defs>
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="currentColor"
                strokeWidth="12"
                className="text-gray-200 dark:text-zinc-800"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="64"
                stroke="url(#aiGaugeGrad)"
                strokeWidth="12"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * clampedScore) / 100}
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: 402 }}
                animate={{ strokeDashoffset: 402 - (402 * clampedScore) / 100 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>

            {/* Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] tabular-nums">
                {score}%
              </span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                AI Reliance
              </span>
            </div>
          </div>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-center font-medium text-muted-foreground max-w-[240px] sm:max-w-[260px]">
            {score <= 30
              ? "High Autonomy • Live Interview Ready"
              : score <= 65
              ? "Balanced Velocity & Mental Depth"
              : "High Risk • Practice Without Copilot"}
          </p>
        </div>

        {/* Right: 3 Pillars Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
          <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-muted-foreground">
            3-Pillar Autonomous Signal Analysis
          </span>

          {/* Pillar 1: Prompt Delegation */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-base">
              <span className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                <Terminal className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                Prompt Delegation (35% Weight)
              </span>
              <span className="font-bold text-[var(--color-primary)] tabular-nums">{pillars.prompt}% AI</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                initial={{ width: 0 }}
                animate={{ width: `${pillars.prompt}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-xs sm:text-base text-muted-foreground block leading-relaxed">
              Measures whether user asks for concepts/hints vs full solution code dumps.
            </span>
          </div>

          {/* Pillar 2: Code Ownership */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-base">
              <span className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                <FileCode2 className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                Code Ownership (35% Weight)
              </span>
              <span className="font-bold text-[var(--color-primary)] tabular-nums">{pillars.ownership}% Owned</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${pillars.ownership}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-xs sm:text-base text-muted-foreground block leading-relaxed">
              Evaluates user&apos;s ability to explain architectural mechanics in their own words.
            </span>
          </div>

          {/* Pillar 3: Live Problem Solving */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-base">
              <span className="font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                <UserCheck2 className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                Whiteboard Readiness (30% Weight)
              </span>
              <span className="font-bold text-[var(--color-primary)] tabular-nums">{pillars.interview}% Score</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[#C084FC]"
                initial={{ width: 0 }}
                animate={{ width: `${pillars.interview}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-xs sm:text-base text-muted-foreground block leading-relaxed">
              Direct verification of unassisted coding confidence during mock sessions.
            </span>
          </div>

          {/* Actionable Interview Readiness Advice */}
          <div className="mt-1 sm:mt-2 rounded-xl border border-[var(--color-primary)]/30 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-transparent p-3.5 sm:p-4 text-xs sm:text-base">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">{verdict}</strong>
                <p className="text-muted-foreground leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
