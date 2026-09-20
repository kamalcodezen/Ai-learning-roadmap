"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, HeartHandshake, CheckCircle2, Sparkles, RefreshCw, Trophy, Loader2 } from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";
import { getRecoveryPlan, claimResilienceBonus, ZeroGuiltRecoveryResult } from "@/src/lib/api/learner/adaptive-recovery";

interface RecoveryStep {
  day: number;
  duration: string;
  title: string;
  subtitle: string;
  type: string;
  taskDetail: string;
}

const DEFAULT_STEPS: RecoveryStep[] = [
  {
    day: 1,
    duration: "5 Mins",
    title: "Concept Warm-Up Refresher",
    subtitle: "Quick digest of the key concepts you mastered before your break.",
    type: "Memory Warm-Up",
    taskDetail: "Review: Asynchronous JavaScript, Event Loop & Promises overview.",
  },
  {
    day: 2,
    duration: "10 Mins",
    title: "Micro Confidence Puzzle",
    subtitle: "A low-friction practical quiz to reactivate your problem-solving reflex.",
    type: "Confidence Booster",
    taskDetail: "Solve: 3 quick logic prompts on Array.reduce & state immutability.",
  },
  {
    day: 3,
    duration: "12 Mins",
    title: "Resume Milestone Frontier",
    subtitle: "Complete the very first small step of your active milestone.",
    type: "Frontier Step",
    taskDetail: "Action: Scaffold your React Custom Hook component structure.",
  },
  {
    day: 4,
    duration: "8 Mins",
    title: "Momentum Lock-in (+50 XP)",
    subtitle: "Celebrate your resilience and seamlessly return to your normal path.",
    type: "Habit Locked",
    taskDetail: "Milestone: Sync your progress and collect +50 Resilience XP bonus.",
  },
];

export default function ZeroGuiltRecoveryCard() {
  const [completedDays, setCompletedDays] = useState<number[]>([1]);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [activeTabDay, setActiveTabDay] = useState<number>(2);
  const [daysInactive, setDaysInactive] = useState<number>(8);
  const [steps, setSteps] = useState<RecoveryStep[]>(DEFAULT_STEPS);

  useEffect(() => {
    let isMounted = true;
    getRecoveryPlan()
      .then((data: ZeroGuiltRecoveryResult) => {
        if (isMounted && data) {
          if (data.daysInactive !== undefined) setDaysInactive(data.daysInactive);
          if (data.plan && data.plan.length > 0) setSteps(data.plan);
        }
      })
      .catch(() => {
        // graceful fallback to dynamic default steps
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDay = (day: number) => {
    if (completedDays.includes(day)) {
      setCompletedDays(completedDays.filter((d) => d !== day));
    } else {
      const nextCompleted = [...completedDays, day].sort();
      setCompletedDays(nextCompleted);
      if (day < 4) {
        setActiveTabDay(day + 1);
      }
    }
  };

  const progressPercentage = Math.round((completedDays.length / 4) * 100);
  const isAllComplete = completedDays.length === 4;

  const handleClaimBonus = async () => {
    setIsClaiming(true);
    try {
      await claimResilienceBonus();
    } catch {
      // optimistic reward update
    }
    setIsClaiming(false);
    setBonusClaimed(true);
  };

  const resetDemo = () => {
    setCompletedDays([1]);
    setBonusClaimed(false);
    setActiveTabDay(2);
  };

  return (
    <div className="dashboard-card w-full rounded-lg p-4 sm:p-8 lg:p-10 transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/60">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-md shadow-purple-500/20">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Feature 02
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs sm:text-base font-medium text-muted-foreground">Inactivity Shield</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-foreground">
              Zero-Guilt Recovery Engine
            </h3>
          </div>
        </div>

        {/* Positive Inactivity Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-xs sm:text-base font-semibold text-[var(--color-primary)] self-start lg:self-center">
          <HeartHandshake className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span>Active: Zero-Streak Penalties ({daysInactive}d Protected)</span>
        </div>
      </div>

      {/* Warm Welcome Banner */}
      <div className="mt-5 sm:mt-6 rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-transparent p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Welcome back! Life gets busy and breaks are 100% normal.
            </h4>
            <p className="text-xs sm:text-base text-muted-foreground mt-0.5 leading-relaxed">
              No broken streaks, no backlog anxiety. Re-ignite your momentum in just 10 minutes a day over the next 4 days.
            </p>
          </div>
        </div>

        <button
          onClick={resetDemo}
          className="self-start sm:self-center flex items-center gap-1.5 text-xs sm:text-base font-semibold text-muted-foreground hover:text-[var(--color-primary)] transition-colors shrink-0 cursor-pointer"
          title="Reset 4-day demo"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* 4-Day Catch-up Stepper Grid */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Day-by-Day Cards */}
        <div className="lg:col-span-7 flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between text-xs sm:text-base font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <span>4-Day Micro Catch-Up Plan</span>
            <span className="text-[var(--color-primary)]">{completedDays.length} of 4 Days ({progressPercentage}%)</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden mb-1.5 sm:mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {steps.map((step) => {
            const isCompleted = completedDays.includes(step.day);
            const isSelected = activeTabDay === step.day;

            return (
              <div
                key={step.day}
                onClick={() => setActiveTabDay(step.day)}
                className={`flex items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/8 shadow-sm"
                    : "border-border/70 hover:border-border bg-black/5 dark:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDay(step.day);
                    }}
                    className={`mt-0.5 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                      isCompleted
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-border bg-white dark:bg-zinc-900 text-transparent hover:border-[var(--color-primary)]"
                    }`}
                    aria-label={`Toggle Day ${step.day}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-base font-bold text-foreground">
                        Day {step.day}: {step.title}
                      </span>
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-[var(--color-primary)]/10 text-[10px] sm:text-xs font-semibold text-[var(--color-primary)]">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-base text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] sm:text-sm font-medium text-muted-foreground shrink-0 hidden sm:block">
                  {step.type}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Active Day Detail Card */}
        <div className="lg:col-span-5 rounded-xl border border-border/80 bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff]/50 dark:from-[#150727] dark:to-[#0a0015] p-4 sm:p-6 flex flex-col justify-between min-h-auto sm:min-h-[290px] shadow-inner">
          {(() => {
            const activeStep = steps.find((s) => s.day === activeTabDay) || steps[0];
            const isDone = completedDays.includes(activeStep.day);

            return (
              <>
                <div>
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border/50">
                    <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Day {activeStep.day} Interactive Task
                    </span>
                    <span className="text-xs sm:text-base font-semibold px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {activeStep.duration}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-foreground mt-2.5 sm:mt-3">
                    {activeStep.title}
                  </h4>
                  <p className="text-xs sm:text-base text-muted-foreground mt-1 leading-relaxed">
                    {activeStep.subtitle}
                  </p>

                  <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-lg border border-border/60 bg-white/60 dark:bg-black/40 text-xs sm:text-base">
                    <span className="font-semibold text-foreground block mb-1">
                      Today&apos;s Focus:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeStep.taskDetail}
                    </p>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50 flex flex-col gap-2">
                  <button
                    onClick={() => toggleDay(activeStep.day)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-base font-bold transition-all duration-200 cursor-pointer ${
                      isDone
                        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-md shadow-purple-500/20"
                        : "bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md shadow-purple-500/20"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isDone ? `Day ${activeStep.day} Marked Complete` : `Complete Day ${activeStep.day} (${activeStep.duration})`}</span>
                  </button>

                  {isAllComplete && (
                    <button
                      onClick={handleClaimBonus}
                      disabled={isClaiming || bonusClaimed}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-base font-bold transition-all duration-300 cursor-pointer ${
                        bonusClaimed
                          ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/40"
                          : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-purple-500/30 animate-pulse"
                      }`}
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Claiming XP...</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4" />
                          <span>{bonusClaimed ? "🏆 +50 XP Bonus Claimed!" : "Claim +50 XP Resilience Bonus"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
