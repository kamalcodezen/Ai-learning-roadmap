"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAiDependency,
  AiDependencyOutput,
} from "@/src/lib/api/learner/adaptive-recovery";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Brain,
  Code2,
  Mic,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface AiDependencyMeterProps {
  initialData?: AiDependencyOutput;
  className?: string;
  defaultExpanded?: boolean;
}

export default function AiDependencyMeter({
  initialData,
  className = "",
  defaultExpanded = false,
}: AiDependencyMeterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { data: serverData, isLoading } = useQuery({
    queryKey: ["aiDependency"],
    queryFn: () => getAiDependency(),
    initialData,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const data = serverData || initialData;

  if (isLoading && !data) {
    return (
      <div className={`rounded-xl border border-border bg-card p-5 animate-pulse ${className}`}>
        <div className="h-6 w-48 bg-muted rounded-lg mb-4" />
        <div className="h-20 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const depScore = data.overallDependencyScore;
  const autonomyScore = data.autonomyScore;

  // Visual status indicators
  let themeColor = "text-primary";
  let statusIcon = <ShieldCheck className="w-5 h-5 text-primary" />;

  if (data.category === "HIGH_RELIANCE") {
    themeColor = "text-rose-500";
    statusIcon = <ShieldAlert className="w-5 h-5 text-rose-500" />;
  } else if (data.category === "BALANCED") {
    themeColor = "text-primary";
    statusIcon = <Zap className="w-5 h-5 text-primary" />;
  }

  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-sm transition-all duration-300 ${className} dashboard-card`}
    >
      {/* Dropdown Accordion Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none border-b border-border/60 hover:bg-muted/20 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-border shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-base md:text-lg">
                AI Dependency & Problem-Solving Meter
              </h3>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                {data.categoryBadge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tracks autonomous problem solving vs AI reliance for live interviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-sm font-semibold text-foreground">
            <span>{depScore}% AI Reliance</span>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title={isExpanded ? "Collapse meter" : "Expand meter"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 md:p-6 space-y-6">
          {/* Main Meter Dial & Category Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 5 cols: Gauge Dial */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-muted/20 rounded-xl border border-border text-center space-y-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Circular Progress */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ${
                      data.category === "HIGH_RELIANCE"
                        ? "stroke-rose-500"
                        : "stroke-primary"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * depScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center score readout */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-foreground tracking-tight">
                    {depScore}%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    AI Reliance
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className={`font-bold text-base ${themeColor} flex items-center justify-center gap-1.5`}>
                  {statusIcon}
                  <span>{data.categoryTitle}</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Autonomy Score: <span className="font-bold text-foreground">{autonomyScore}%</span> (Self-Reliance)
                </p>
              </div>
            </div>

            {/* Right 7 cols: Employer Perception & 3 Pillars */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Employer Hiring Signal
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {data.employerSignalRating.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.employerPerceptionSummary}
                </p>
              </div>

              {/* 3 Pillars Breakdown */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Autonomy Breakdown Pillars
                </div>

                {/* Pillar 1: Prompting Autonomy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-primary" />
                      {data.pillars.promptAutonomy.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {data.pillars.promptAutonomy.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${data.pillars.promptAutonomy.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {data.pillars.promptAutonomy.metricData}
                  </p>
                </div>

                {/* Pillar 2: Project Code Articulation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-primary" />
                      {data.pillars.projectExplanation.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {data.pillars.projectExplanation.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${data.pillars.projectExplanation.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {data.pillars.projectExplanation.metricData}
                  </p>
                </div>

                {/* Pillar 3: Live Screening Recall */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-primary" />
                      {data.pillars.interviewArticulation.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {data.pillars.interviewArticulation.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${data.pillars.interviewArticulation.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {data.pillars.interviewArticulation.metricData}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Remedies to Maximize Live Interview Pass Probability */}
          <div className="pt-2 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Interview Preparation Recommendations
              </h4>
              <Link
                href="/dashboard/learner/interview"
                className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span>Practice Mock Interview</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.actionableRemedies.map((remedy, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-1.5"
                >
                  <div className="font-bold text-sm text-foreground leading-tight">
                    {remedy.title}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {remedy.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
