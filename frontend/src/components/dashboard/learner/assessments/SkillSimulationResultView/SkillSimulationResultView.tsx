"use client";

import { Card, CardContent } from "@/src/components/ui/Card";
import { SimulationResultData } from "@/src/lib/api/learner/assessments";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Target,
  Sparkles,
  Code2,
  Bug,
  BookOpen,
  MessageSquareText,
} from "lucide-react";
import { DashboardButton } from "@/src/components/dashboard/shared/patterns";

interface Props {
  result: SimulationResultData;
  onRetake: () => void;
}

export default function SkillSimulationResultView({ result, onRetake }: Props) {
  const isPassing = result.overallScore >= 70;

  const scoreColor = isPassing
    ? "text-green-500 border-green-500/30 bg-green-500/10"
    : result.overallScore >= 50
      ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
      : "text-rose-500 border-rose-500/30 bg-rose-500/10";

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" /> Skill Mastery Simulation Result
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              {result.skill}
            </h1>
            {result.targetRole && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {result.targetRole}
              </span>
            )}
            {result.difficulty && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase text-[10px]">
                {result.difficulty}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Completed on {new Date(result.completedAt).toLocaleDateString()}{" "}
            with authentic performance scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-card-soft transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retake
          </button>
          <DashboardButton
            href="/dashboard/learner/assessments"
            text={
              <>
                All Assessments <ArrowRight className="w-4 h-4" />
              </>
            }
          />
        </div>
      </div>

      {/* Main Score Hero Card */}
      <Card className="border-2 border-border/80 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${scoreColor}`}
              >
                {isPassing ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {isPassing
                  ? "Mastery Demonstrated"
                  : result.overallScore >= 50
                    ? "Foundational Proficiency"
                    : "Active Skill Gap"}
              </span>
              <h2 className="text-2xl font-bold text-foreground">
                {isPassing
                  ? "You demonstrated strong practical understanding!"
                  : "Continued practice recommended."}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                {result.feedback}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card-soft border border-border/70 shrink-0 min-w-[160px]">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                Overall Score
              </span>
              <span
                className={`text-5xl font-extrabold tracking-tight ${
                  isPassing
                    ? "text-green-500"
                    : result.overallScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                }`}
              >
                {result.overallScore}%
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">
                Canonical SkillState updated
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-Stage Dimension Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Evaluation Breakdown by
          Stage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 dashboard-card-gap">
          {/* Stage 1 */}
          <Card className="border border-border/70">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="w-4 h-4 text-blue-500" /> 1. Understand &
                  Concepts
                </div>
                <span className="font-bold text-sm">
                  {result.stageBreakdown.understand}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.stageBreakdown.understand}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Fundamental principles, runtime mechanics, and theory.
              </p>
            </CardContent>
          </Card>

          {/* Stage 2 */}
          <Card className="border border-border/70">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Bug className="w-4 h-4 text-amber-500" /> 2. Debugging &
                  Analysis
                </div>
                <span className="font-bold text-sm">
                  {result.stageBreakdown.debug}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.stageBreakdown.debug}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Identifying subtle code bugs and implementing root-cause fixes.
              </p>
            </CardContent>
          </Card>

          {/* Stage 3 */}
          <Card className="border border-border/70">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Code2 className="w-4 h-4 text-emerald-500" /> 3. Code
                  Implementation
                </div>
                <span className="font-bold text-sm">
                  {result.stageBreakdown.code}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.stageBreakdown.code}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Writing robust, syntactically correct code following standards.
              </p>
            </CardContent>
          </Card>

          {/* Stage 4 */}
          <Card className="border border-border/70">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquareText className="w-4 h-4 text-purple-500" /> 4.
                  Technical Explanation
                </div>
                <span className="font-bold text-sm">
                  {result.stageBreakdown.explain}%
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.stageBreakdown.explain}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Articulating architectural tradeoffs in your own words.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strong Areas & Needs Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        {result.strongAreas.length > 0 && (
          <Card className="border border-green-500/20 bg-green-500/5">
            <CardContent className="p-5 space-y-2.5">
              <h4 className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Strong Areas
              </h4>
              <ul className="space-y-1.5">
                {result.strongAreas.map((area, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-foreground flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.needsPractice.length > 0 && (
          <Card className="border border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-5 space-y-2.5">
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Areas to Reinforce
              </h4>
              <ul className="space-y-1.5">
                {result.needsPractice.map((area, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-foreground flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Actions */}
      <div className="p-6 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            Continue Learning
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Study curated resources on your active Learning Path to reinforce
            this skill.
          </p>
        </div>
        <DashboardButton
          href={`/dashboard/learner/learning-path?skill=${encodeURIComponent(result.skill)}`}
          text={
            <>
              Open Learning Path <ArrowRight className="w-3.5 h-3.5" />
            </>
          }
          size="md"
          className="rounded-lg shrink-0 text-xs"
        />
      </div>
    </div>
  );
}
