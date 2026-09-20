"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecoveryStatus,
  completeRecoveryStep,
  dismissRecovery,
  ZeroGuiltRecoveryOutput,
  RecoveryStep,
} from "@/src/lib/api/learner/adaptive-recovery";
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  Trophy,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { triggerRealtimeSync } from "@/src/lib/utils/realtime-sync";

interface ZeroGuiltRecoveryBannerProps {
  initialData?: ZeroGuiltRecoveryOutput;
  className?: string;
  forceShow?: boolean;
  allowAccordionPreview?: boolean;
  defaultExpanded?: boolean;
}

export default function ZeroGuiltRecoveryBanner({
  initialData,
  className = "",
  forceShow = false,
  allowAccordionPreview = false,
  defaultExpanded = false,
}: ZeroGuiltRecoveryBannerProps) {
  const queryClient = useQueryClient();
  const [isBannerOpen, setIsBannerOpen] = useState(defaultExpanded);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState<number | null>(null);
  const [puzzleSubmitted, setPuzzleSubmitted] = useState(false);

  const { data: serverData, isLoading } = useQuery({
    queryKey: ["recoveryStatus"],
    queryFn: () => getRecoveryStatus(),
    initialData,
    staleTime: 5000,
  });

  const data = serverData || initialData;

  const stepMutation = useMutation({
    mutationFn: (dayIndex: number) => completeRecoveryStep(dayIndex),
    onSuccess: (updated) => {
      queryClient.setQueryData(["recoveryStatus"], updated);
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["adaptiveRecovery"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["gemWallet"] });
      queryClient.invalidateQueries({ queryKey: ["gemHistory"] });
      triggerRealtimeSync(queryClient);
      setPuzzleSubmitted(false);
      setPuzzleAnswer(null);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: () => dismissRecovery(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recoveryStatus"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  // Check if banner should be displayed automatically (inactivity >= 7 days or active recovery)
  const isAutoActive =
    forceShow ||
    (data && (data.isRecoveryActive || data.isRecoveryEligible) && !data.isDismissed && !data.isCompleted);

  if (isLoading && !data) {
    return null;
  }

  // When user is active and allowAccordionPreview is not enabled (e.g. Home Dashboard), keep hidden
  if (!isAutoActive && !allowAccordionPreview && !forceShow) {
    return null;
  }

  if (!data) return null;

  const currentStep = data.steps.find((s) => !s.completed) || data.steps[data.steps.length - 1];

  const handlePuzzleSelect = (index: number) => {
    if (puzzleSubmitted) return;
    setPuzzleAnswer(index);
  };

  const handlePuzzleSubmit = (step: RecoveryStep) => {
    if (puzzleAnswer === null) return;
    setPuzzleSubmitted(true);
    if (puzzleAnswer === step.content.puzzleCorrectIndex) {
      stepMutation.mutate(step.dayIndex);
    }
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-sm transition-all duration-300 ${className}`}
    >
      {/* Dropdown Accordion Header */}
      <div
        onClick={() => setIsBannerOpen(!isBannerOpen)}
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none border-b border-border/60 hover:bg-muted/20 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-border shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-base md:text-lg">
                Zero-Guilt Recovery Engine
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                {isAutoActive ? "Active Recovery" : "4-Day Catch-Up Plan"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAutoActive
                ? data.welcomeMessage.heading
                : "Drop-off protection & micro catch-up plan (+50 XP bonus)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs font-semibold text-foreground">
            <span>{data.completedStepsCount}/{data.totalStepsCount} Steps</span>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title={isBannerOpen ? "Collapse recovery" : "Expand recovery"}
          >
            {isBannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isBannerOpen && (
        <div className="p-4 md:p-6 space-y-5">
          {/* Empathetic Welcome Header */}
          <div className="space-y-1.5">
            <h4 className="text-lg md:text-xl font-bold text-foreground">
              {data.welcomeMessage.heading}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {data.welcomeMessage.subheading}{" "}
              <span className="text-foreground font-medium">
                {data.welcomeMessage.encouragement}
              </span>
            </p>
          </div>

          {/* 4-Day Micro Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {data.steps.map((step) => {
              const isCurrent = currentStep?.dayIndex === step.dayIndex;
              const isExpanded = activeStepIndex === step.dayIndex || (activeStepIndex === null && isCurrent);

              return (
                <div
                  key={step.dayIndex}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                    step.completed
                      ? "bg-muted/30 border-border"
                      : isCurrent
                      ? "bg-card border-primary ring-1 ring-primary/30 shadow-xs"
                      : "bg-card border-border opacity-75"
                  }`}
                >
                  {/* Step Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          step.completed
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : isCurrent
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        Day {step.dayIndex}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{step.estimatedMinutes}m</span>
                        {step.completed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />
                        )}
                      </div>
                    </div>

                    <h5 className="font-bold text-sm text-foreground leading-tight">
                      {step.title.replace(/^Day \d+:\s*/, "")}
                    </h5>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Step Action / Drawer trigger */}
                  <div className="pt-3 mt-3 border-t border-border/50">
                    {step.completed ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStepIndex(
                            activeStepIndex === step.dayIndex ? null : step.dayIndex
                          )
                        }
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        <span>{isExpanded ? "Close Task" : "Open Task"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Interactive Workspace for Selected Step */}
          {activeStepIndex !== null && (
            <div className="p-4 md:p-5 rounded-xl bg-muted/20 border border-border animate-in fade-in zoom-in-95 duration-200">
              {(() => {
                const step = data.steps.find((s) => s.dayIndex === activeStepIndex);
                if (!step) return null;

                return (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Day {step.dayIndex} Focus
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {step.estimatedMinutes} minutes commitment
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {step.content.description}
                      </p>
                    </div>

                    {/* Day 1: Refresher bullets */}
                    {step.type === "REFRESHER" && step.content.details && (
                      <div className="bg-card p-4 rounded-xl border border-border space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span>Key Concept Anchor ({step.content.targetSkillOrConcept})</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-foreground">
                          {step.content.details.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Day 2: Micro Confidence Puzzle */}
                    {step.type === "PUZZLE" && (
                      <div className="bg-card p-4 rounded-xl border border-border space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <HelpCircle className="w-4 h-4" />
                          <span>10-Minute Problem Solving Revival</span>
                        </div>

                        <p className="text-sm font-semibold text-foreground">
                          {step.content.puzzleQuestion}
                        </p>

                        <div className="space-y-2">
                          {step.content.puzzleOptions?.map((opt, idx) => {
                            const isSelected = puzzleAnswer === idx;
                            const isCorrect = idx === step.content.puzzleCorrectIndex;
                            let btnStyle = "border-border bg-card hover:bg-muted/50 text-foreground";

                            if (puzzleSubmitted) {
                              if (isCorrect) {
                                btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold";
                              } else if (isSelected && !isCorrect) {
                                btnStyle = "border-rose-500 bg-rose-500/10 text-rose-500";
                              }
                            } else if (isSelected) {
                              btnStyle = "border-primary bg-primary/10 text-primary font-semibold";
                            }

                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={puzzleSubmitted}
                                onClick={() => handlePuzzleSelect(idx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {puzzleSubmitted && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {puzzleSubmitted && (
                          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground animate-in fade-in">
                            <span className="font-bold text-foreground">Explanation: </span>
                            {step.content.puzzleExplanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Day 3: Roadmap Milestone Step */}
                    {step.type === "ROADMAP_STEP" && (
                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h5 className="font-bold text-sm text-foreground">
                              Target Stage: {step.content.targetSkillOrConcept}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Dive directly into your upcoming milestone without cognitive overload.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => stepMutation.mutate(step.dayIndex)}
                            disabled={stepMutation.isPending}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-xs"
                          >
                            Mark Frontier Active
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Day 4: Lock In Momentum +50 XP */}
                    {step.type === "MOMENTUM_BOOST" && (
                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-border">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-foreground">
                              Claim +50 XP Resilience Bonus
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Locks in your momentum and automatically returns you to your normal roadmap flow.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action button for Refresher / Puzzle / Bonus */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {step.type === "PUZZLE" && !puzzleSubmitted && (
                        <button
                          type="button"
                          disabled={puzzleAnswer === null}
                          onClick={() => handlePuzzleSubmit(step)}
                          className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Check Answer
                        </button>
                      )}

                      {(step.type === "REFRESHER" || step.type === "MOMENTUM_BOOST") && (
                        <button
                          type="button"
                          disabled={stepMutation.isPending}
                          onClick={() => stepMutation.mutate(step.dayIndex)}
                          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          {stepMutation.isPending ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Marking Done...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{step.content.actionLabel}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Footer Utility: Skip or Simulate */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <span>
              Take your time — consistency is about returning gently, not burning out.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => dismissMutation.mutate()}
                className="hover:text-foreground underline transition-colors cursor-pointer"
              >
                Skip and resume regular roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
