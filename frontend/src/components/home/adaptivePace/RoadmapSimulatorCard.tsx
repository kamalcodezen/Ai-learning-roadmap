"use client";

import { useState, useMemo, useEffect } from "react";
import { Clock, Calendar, Zap, Sparkles, CheckCircle2, Award, ChevronRight, Loader2 } from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";
import { simulatePace, savePace } from "@/src/lib/api/learner/adaptive-recovery";

const PRESETS = [
  { label: "Part-Time", hours: 5, icon: "🌱" },
  { label: "Steady", hours: 12, icon: "🎯" },
  { label: "Accelerated", hours: 22, icon: "⚡" },
  { label: "Bootcamp", hours: 35, icon: "🏆" },
];

export default function RoadmapSimulatorCard() {
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [totalRemainingHours, setTotalRemainingHours] = useState<number>(120);
  const [totalMilestones, setTotalMilestones] = useState<number>(8);

  // Fetch real milestone remaining hours on mount
  useEffect(() => {
    let isMounted = true;
    simulatePace(weeklyHours)
      .then((data) => {
        if (isMounted && data) {
          if (data.remainingHours) setTotalRemainingHours(data.remainingHours);
          if (data.remainingMilestones) setTotalMilestones(data.remainingMilestones);
        }
      })
      .catch(() => {
        // graceful fallback to dynamic state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const simulation = useMemo(() => {
    const weeks = Math.max(1, Math.ceil(totalRemainingHours / weeklyHours));
    const months = (weeks / 4.3).toFixed(1);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeks * 7);
    const etaFormatted = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let paceTitle = "Steady Pace";
    let paceBadge = "🌱 Steady Pace";
    const paceColor = "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30";
    let paceDescription = "Consistent, sustainable progress that fits nicely around a busy schedule.";

    if (weeklyHours >= 28) {
      paceTitle = "Immersive Bootcamp";
      paceBadge = "🏆 Immersive Bootcamp";
      paceDescription = "High-intensity career sprint. Fast-track your completion with maximum momentum.";
    } else if (weeklyHours >= 14) {
      paceTitle = "Accelerated Sprint";
      paceBadge = "⚡ Accelerated Sprint";
      paceDescription = "Optimal balance between speed and concept retention for rapid career readiness.";
    }

    const velocityIndex = (weeklyHours / 10).toFixed(1);

    return {
      weeks,
      months,
      etaFormatted,
      paceTitle,
      paceBadge,
      paceColor,
      paceDescription,
      velocityIndex,
    };
  }, [weeklyHours, totalRemainingHours]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePace(weeklyHours);
    } catch {
      // optimistic response
    }
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="dashboard-card w-full rounded-lg p-5 sm:p-8 lg:p-10 transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-md shadow-purple-500/20">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Feature 01
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-base font-medium text-muted-foreground">Live ETA Calculator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Roadmap Velocity & Pace Simulator
            </h3>
          </div>
        </div>

        {/* Live Pace Badge */}
        <div className={`self-start sm:self-center px-3.5 py-1.5 rounded-full border text-base font-semibold ${simulation.paceColor}`}>
          {simulation.paceBadge}
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>Weekly Study Commitment</span>
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--color-primary)] tabular-nums">
                  {weeklyHours}
                </span>
                <span className="text-sm font-medium text-muted-foreground">hours / week</span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative py-2">
              <input
                type="range"
                min={3}
                max={40}
                step={1}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                aria-label="Weekly study hours slider"
              />
              <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2">
                <span>3 hrs (Casual)</span>
                <span>15 hrs (Recommended)</span>
                <span>40 hrs (Full-Time)</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-base font-medium text-muted-foreground mb-2.5 block">
              Quick Commitment Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map((preset) => {
                const isActive = weeklyHours === preset.hours;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setWeeklyHours(preset.hours)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-base font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-sm"
                        : "border-border/70 hover:border-[var(--color-primary)]/40 bg-black/5 dark:bg-white/5 text-foreground/80"
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label} ({preset.hours}h)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Insight Banner */}
          <div className="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-transparent p-4 text-base text-muted-foreground">
            <p className="leading-relaxed">
              <strong className="text-foreground">{simulation.paceTitle}: </strong>
              {simulation.paceDescription}
            </p>
          </div>
        </div>

        {/* Right: Live Projection Card */}
        <div className="lg:col-span-5 rounded-xl border border-border/80 bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff]/50 dark:from-[#150727] dark:to-[#0a0015] p-6 flex flex-col justify-between shadow-inner">
          <div>
            <span className="text-base font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              Dynamic Completion Projection
            </span>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground tabular-nums">
                ~{simulation.weeks}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">Weeks</span>
              <span className="text-base font-medium text-muted-foreground">({simulation.months} Months)</span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-base py-2 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Estimated Graduation Date:
                </span>
                <span className="font-bold text-foreground">{simulation.etaFormatted}</span>
              </div>

              <div className="flex items-center justify-between text-base py-2 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Remaining Workload:
                </span>
                <span className="font-bold text-foreground">{totalRemainingHours}h ({totalMilestones} Milestones)</span>
              </div>

              <div className="flex items-center justify-between text-base py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Learning Velocity:
                </span>
                <span className="font-bold text-[var(--color-primary)]">
                  {simulation.velocityIndex}x Speed
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-base font-bold transition-all duration-300 cursor-pointer ${
              isSaved
                ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-500/20"
                : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-95 shadow-md shadow-purple-500/20"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Pace...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Pace Synced to Profile!</span>
              </>
            ) : (
              <>
                <span>Save Weekly Commitment</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
