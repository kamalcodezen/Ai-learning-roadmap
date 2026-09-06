"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Target,
  AlertTriangle,
  Award,
  Sparkles,
  MessageSquare,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DiagnosticResultData } from "@/src/lib/api/learner/diagnostic";

interface DiagnosticResultViewProps {
  result: DiagnosticResultData;
  onRetake?: () => void;
}

export default function DiagnosticResultView({
  result,
  onRetake,
}: DiagnosticResultViewProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const displayScore = result.overallScore ?? result.score ?? 0;
  const correctCount = result.correctAnswers ?? 0;
  const mcqTotal = result.mcqCount ?? 5;

  const skills = result.skills || [];
  const strengths = result.strengths || [];
  const skillGaps = result.skillGaps || [];
  const communication = result.communication;
  const recommendations = result.recommendations || [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[140px]" />
        <div className="absolute -left-64 top-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute -right-64 bottom-[10%] h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
        {/* ============================================================ */}
        {/* HEADER & OVERALL SCORE */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-[32px] border border-border bg-card/85 p-8 shadow-[var(--shadow)] backdrop-blur-xl sm:p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Diagnostic Complete
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Skill-Gap Diagnosis is Ready
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            We evaluated your 5 technical challenges and open-ended communication response against real industry standards. Here is your personalized skill breakdown.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Overall Technical Score */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-primary/25 bg-primary/[0.06] p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Technical MCQ Score
              </span>
              <span className="mt-2 text-5xl font-extrabold tracking-tight text-primary">
                {displayScore}%
              </span>
              <span className="mt-2 text-xs font-medium text-muted-foreground">
                {correctCount} of {mcqTotal} technical questions correct
              </span>
            </div>

            {/* Communication Score / Status */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card-soft p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Communication Evaluation
              </span>
              {communication?.isAvailable ? (
                <>
                  <span className="mt-2 text-5xl font-extrabold tracking-tight text-foreground">
                    {communication.score}%
                  </span>
                  <span className="mt-2 text-xs font-medium text-muted-foreground">
                    AI evaluated across 5 speech dimensions
                  </span>
                </>
              ) : (
                <>
                  <span className="mt-2 text-2xl font-bold text-muted-foreground">
                    Submitted
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground text-center">
                    Evaluation pending or unavailable
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/learner/skill-gaps"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
            >
              <Target className="h-4 w-4" />
              View Skill Gaps
            </Link>

            <Link
              href="/dashboard/learner/learning-path"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
            >
              <Compass className="h-4 w-4" />
              Open Learning Path
            </Link>

            <Link
              href="/dashboard/learner"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Continue to Dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SKILL ANALYSIS (MCQ BREAKDOWN) */}
        {/* ============================================================ */}
        <section className="mt-10 rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Your Skill Analysis</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Dynamically calculated from your real diagnostic answers.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full w-fit">
              {skills.length} Evaluated Skill{skills.length !== 1 ? "s" : ""}
            </span>
          </div>

          {skills.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Skill analysis is temporarily unavailable.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {skills.map((skill) => {
                const isStrong = skill.status === "STRONG";
                const isMedium = skill.status === "MEDIUM";

                const badgeBg = isStrong
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : isMedium
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/25";

                const barColor = isStrong
                  ? "bg-emerald-500"
                  : isMedium
                  ? "bg-amber-500"
                  : "bg-rose-500";

                return (
                  <div
                    key={skill.skill}
                    className="rounded-2xl border border-border/70 bg-card-soft p-4 sm:p-5 transition hover:border-primary/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base text-foreground">
                          {skill.skill}
                        </span>
                        <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {skill.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {skill.correctAnswers}/{skill.totalQuestions} correct
                        </span>
                        <span className="text-base font-bold text-foreground">
                          {skill.score}%
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeBg}`}
                        >
                          {skill.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${Math.max(6, skill.score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* STRENGTHS & SKILL GAPS (SIDE BY SIDE / GRID) */}
        {/* ============================================================ */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* STRENGTHS */}
          <section className="rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8 flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your Strengths</h3>
                <p className="text-xs text-muted-foreground">
                  High proficiency skills (&ge; 80%) verified in assessment
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 flex-1">
              {strengths.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground my-auto">
                  <Sparkles className="mx-auto h-6 w-6 text-muted-foreground/60 mb-2" />
                  No skills qualified as Strong yet (&ge; 80%). Follow your personalized roadmap to elevate your foundational skills.
                </div>
              ) : (
                strengths.map((s) => (
                  <div
                    key={s.skill}
                    className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-sm">{s.skill}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      {s.score}% (Strong)
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SKILL GAPS */}
          <section className="rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8 flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your Skill Gaps</h3>
                <p className="text-xs text-muted-foreground">
                  Identified areas needing immediate study and hands-on reinforcement
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 flex-1">
              {skillGaps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground my-auto">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400 mb-2" />
                  No critical skill gaps detected! You are performing solidly across evaluated domains.
                </div>
              ) : (
                skillGaps.map((gap) => {
                  const isCritical = gap.gapLevel === "HIGH" || gap.severity === "critical";
                  const badgeClass = isCritical
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30";

                  return (
                    <div
                      key={gap.skill}
                      className="rounded-2xl border border-border/80 bg-card-soft p-4 transition hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{gap.skill}</span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                          >
                            {isCritical ? "Critical Gap" : "Moderate Gap"}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {gap.score}%
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {gap.reason}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                        <span className="text-muted-foreground truncate max-w-[220px]">
                          {gap.evidence}
                        </span>
                        <Link
                          href={gap.href}
                          className="font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                          {gap.recommendedAction}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/* COMMUNICATION ANALYSIS (QUESTION 6 EVALUATION) */}
        {/* ============================================================ */}
        <section className="mt-10 rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Technical Communication Analysis
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Evaluated from your open-ended explanation challenge (STAR method &amp; architectural clarity).
                </p>
              </div>
            </div>

            {communication?.isAvailable && (
              <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-2 self-start sm:self-auto">
                <span className="text-xs text-muted-foreground">Overall Score:</span>
                <span className="text-lg font-bold text-primary">
                  {communication.score}%
                </span>
              </div>
            )}
          </div>

          {!communication || !communication.isAvailable ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Communication evaluation is not available yet.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Question Context */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs">
                <span className="font-semibold text-foreground">Challenge Prompt: </span>
                <span className="text-muted-foreground">{communication.question}</span>
              </div>

              {/* 5 Dimensions Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Clarity", val: communication.clarity },
                  { label: "Structure", val: communication.structure },
                  { label: "Technical Depth", val: communication.technicalExplanation },
                  { label: "Relevance", val: communication.relevance },
                  { label: "Completeness", val: communication.completeness },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-border/70 bg-card-soft p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{metric.label}</span>
                      <span className="font-bold text-foreground">{metric.val}%</span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(6, metric.val)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Feedback */}
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI Evaluator Feedback
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {communication.feedback}
                </p>
              </div>

              {/* Candidate Transcript Accordion */}
              {communication.transcript && (
                <div className="rounded-2xl border border-border/60 bg-card-soft overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTranscript((prev) => !prev)}
                    className="flex w-full items-center justify-between p-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Your Recorded Answer / Transcript
                    </span>
                    {showTranscript ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showTranscript && (
                    <div className="border-t border-border/60 p-4 text-xs leading-relaxed text-muted-foreground bg-background/50 whitespace-pre-wrap font-mono">
                      {communication.transcript}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* RECOMMENDED NEXT STEPS */}
        {/* ============================================================ */}
        <section className="mt-10 rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Recommended Next Steps</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Action items prioritized from your diagnostic gaps to fast-track production readiness.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendations.map((rec, index) => {
              const isHigh = rec.priority === "HIGH";
              const priorityClass = isHigh
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30";

              return (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-border/80 bg-card-soft p-5 flex flex-col justify-between transition hover:border-primary/30 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        0{index + 1}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h4 className="mt-3 text-base font-semibold text-foreground">
                      {rec.title}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>

                  <Link
                    href={rec.actionUrl}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 text-xs font-semibold transition"
                  >
                    {rec.actionText}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
            {onRetake ? (
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Diagnostic Assessment
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                href="/dashboard/learner/skill-gaps"
                className="rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                View All Skill Gaps
              </Link>
              <Link
                href="/dashboard/learner"
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition shadow-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
