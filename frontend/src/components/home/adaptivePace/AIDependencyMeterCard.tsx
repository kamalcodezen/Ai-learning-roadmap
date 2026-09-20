"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Scale, ShieldAlert, Sparkles, Terminal, FileCode2, UserCheck2, CheckCircle, Info } from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";

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
    badge: "🟢 Independent Problem Solver (0%–30%)",
    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
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
    badge: "🟡 Balanced AI Augmentation (31%–65%)",
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
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
    badge: "🔴 High AI Reliance Alert (66%–100%)",
    badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    advice: "Warning: Live whiteboard interviews don't allow AI. Action Tip: Solve the next milestone without Copilot prompts to build mental muscle memory.",
  },
];

export default function AIDependencyMeterCard() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("balanced");

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[1];
  const { score, pillars, verdict, badge, badgeColor, advice } = currentPersona;

  // Gauge calculation
  const clampedScore = Math.max(2, Math.min(100, score));

  return (
    <div className="group relative w-full rounded-2xl border border-border/80 bg-white/70 dark:bg-[#0c0516]/80 p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-xl shadow-purple-500/5 transition-all duration-300 hover:border-[var(--color-primary)]/40">
      <BorderBeam size={320} duration={11} colorFrom="#9F54F7" colorTo="#B978FF" delay={4} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Feature 03
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs font-medium text-muted-foreground">Whiteboard Interview Readiness</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              AI Dependency & Problem-Solving Meter
            </h3>
          </div>
        </div>

        {/* Live Classification Badge */}
        <div className={`self-start sm:self-center px-3.5 py-1.5 rounded-full border text-xs font-semibold ${badgeColor}`}>
          {badge}
        </div>
      </div>

      {/* Interactive Profile Persona Selector */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Brain className="h-4 w-4 text-[var(--color-primary)]" />
          <span>Simulate Learner Profile:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((p) => {
            const isActive = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersonaId(p.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 border border-border/70 hover:border-border text-foreground/80"
                }`}
              >
                {p.label} ({p.score}%)
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visual Gauge + 3 Pillars */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Radial Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl border border-border/80 bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff]/50 dark:from-[#150727] dark:to-[#0a0015] shadow-inner">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            AI Dependency Index
          </span>

          {/* SVG Gauge */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
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
                stroke={score > 65 ? "#f43f5e" : score > 30 ? "#eab308" : "#10b981"}
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
              <span className="text-3xl font-extrabold text-foreground tabular-nums">
                {score}%
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                AI Reliance
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-center font-medium text-muted-foreground max-w-[260px]">
            {score <= 30
              ? "High Autonomy • Live Interview Ready"
              : score <= 65
              ? "Balanced Velocity & Mental Depth"
              : "High Risk • Practice Without Copilot"}
          </p>
        </div>

        {/* Right: 3 Pillars Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            3-Pillar Autonomous Signal Analysis
          </span>

          {/* Pillar 1: Prompt Delegation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                Prompt Delegation & Prompt Depth (35% Weight)
              </span>
              <span className="font-bold text-muted-foreground tabular-nums">{pillars.prompt}% AI Used</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className={`h-full ${pillars.prompt > 70 ? "bg-rose-500" : pillars.prompt > 35 ? "bg-amber-500" : "bg-emerald-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pillars.prompt}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Measures whether user asks for concepts/hints vs full solution code dumps.
            </span>
          </div>

          {/* Pillar 2: Code Ownership */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <FileCode2 className="h-3.5 w-3.5 text-blue-500" />
                Code Ownership & Architecture Articulation (35% Weight)
              </span>
              <span className="font-bold text-muted-foreground tabular-nums">{pillars.ownership}% Owned</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${pillars.ownership}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Evaluates user&apos;s ability to explain architectural mechanics in their own words.
            </span>
          </div>

          {/* Pillar 3: Live Problem Solving */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <UserCheck2 className="h-3.5 w-3.5 text-purple-500" />
                Live Whiteboard & Mock Technical Interview (30% Weight)
              </span>
              <span className="font-bold text-muted-foreground tabular-nums">{pillars.interview}% Score</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${pillars.interview}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Direct verification of unassisted coding confidence during mock sessions.
            </span>
          </div>

          {/* Actionable Interview Readiness Advice */}
          <div className="mt-2 rounded-xl border border-border/70 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent p-4 text-xs">
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
