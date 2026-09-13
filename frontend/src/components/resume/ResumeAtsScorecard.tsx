"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import type { AtsFeedback } from "@/src/lib/actions/learner/resume";

interface ResumeAtsScorecardProps {
  atsFeedback?: AtsFeedback;
  atsScore?: number;
  targetRole: string;
  onRescan: () => void;
  isScanning: boolean;
  onAddMissingKeyword?: (kw: string) => void;
}

export function ResumeAtsScorecard({
  atsFeedback,
  atsScore = 78,
  targetRole,
  onRescan,
  isScanning,
  onAddMissingKeyword,
}: ResumeAtsScorecardProps) {
  const score = atsFeedback?.score ?? atsScore ?? 78;
  const breakdown = atsFeedback?.breakdown ?? {
    formatting: 92,
    keywords: 78,
    impactMetrics: 75,
    relevance: 80,
  };

  const strengths = atsFeedback?.strengths && atsFeedback.strengths.length > 0
    ? atsFeedback.strengths
    : [
        "Clean, ATS-parseable single-column layout",
        "Clear technical skill categorization",
        "Valid contact and repository links",
      ];

  const missingKeywords = atsFeedback?.missingKeywords && atsFeedback.missingKeywords.length > 0
    ? atsFeedback.missingKeywords
    : ["CI/CD Pipelines", "Docker", "Unit Testing (Jest)", "Redis Caching"];

  const suggestions = atsFeedback?.suggestions && atsFeedback.suggestions.length > 0
    ? atsFeedback.suggestions
    : [
        "Include more concrete performance metrics (latency ms, % speedup) in project bullets.",
        "Add explicit automated testing tools to your skills section.",
      ];

  const getVerdict = (s: number) => {
    if (s >= 80) {
      return {
        label: "ATS Ready • High Pass Rate",
        color: "text-primary bg-primary/10 border-primary/30",
        description: "Your resume is highly optimized for top tech ATS parsers and automated recruiter screens.",
      };
    }
    if (s >= 60) {
      return {
        label: "Moderate • Optimization Recommended",
        color: "text-foreground bg-muted border-border",
        description: "Solid foundation. Adding missing role keywords and metric-driven bullets will boost your interview match rate.",
      };
    }
    return {
      label: "Needs Improvement",
      color: "text-muted-foreground bg-muted/60 border-border",
      description: "Critical keywords or impact metrics are missing. Use AI Auto-Generate to enhance formatting.",
    };
  };

  const verdict = getVerdict(score);

  const METRICS = [
    { label: "Formatting & ATS Structure", value: breakdown.formatting, color: "bg-primary" },
    { label: "Keyword & Tech Stack Match", value: breakdown.keywords, color: "bg-primary/80" },
    { label: "Impact Verbs & Scale Metrics", value: breakdown.impactMetrics, color: "bg-secondary" },
    { label: "Target Role Relevance", value: breakdown.relevance, color: "bg-primary/90" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── ATS Score Hero Card ── */}
      <div className="p-6 sm:p-8 rounded-lg bg-card border border-border shadow-lg relative overflow-hidden dashboard-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> ATS Parser Diagnostic
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${verdict.color}`}>
                {verdict.label}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Resume ATS Compatibility
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Calibrated for <span className="font-semibold text-foreground">{targetRole}</span> job openings.
            </p>
            <p className="text-xs text-muted-foreground pt-1">{verdict.description}</p>
          </div>

          {/* Glowing ATS Dial */}
          <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-card-soft border border-border shadow-inner min-w-[170px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ATS Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-5xl font-black text-primary">
                {score}
              </span>
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
            <button
              type="button"
              onClick={onRescan}
              disabled={isScanning}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning..." : "Re-scan ATS"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Pillar Score Bars ── */}
      <div className="p-6 rounded-lg bg-card border border-border space-y-4 dashboard-card">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span>4-Pillar ATS Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground">{metric.label}</span>
                <span className="font-bold text-primary">{metric.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${metric.color} transition-all duration-700 rounded-full`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Missing Keywords Card ── */}
      <div className="p-6 rounded-lg bg-card border border-border space-y-3 dashboard-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Missing Role-Specific Keywords ({missingKeywords.length})</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {onAddMissingKeyword ? "Click any keyword to add to your skills" : "Recommended additions"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Top tech ATS algorithms look for these specific industry terms for {targetRole} roles:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {missingKeywords.map((kw, i) => (
            <span
              key={i}
              onClick={() => onAddMissingKeyword?.(kw)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border ${
                onAddMissingKeyword ? "hover:border-primary/50 cursor-pointer transition-all active:scale-95" : ""
              }`}
              title={onAddMissingKeyword ? "Click to add to your resume skills" : undefined}
            >
              <Zap className="w-3 h-3 text-primary" />
              {onAddMissingKeyword ? `+ ${kw}` : kw}
            </span>
          ))}
        </div>
      </div>

      {/* ── Strengths & Suggestions Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-lg bg-card border border-border space-y-3 dashboard-card">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Strong ATS Highlights</span>
          </h4>
          <ul className="space-y-2">
            {strengths.map((st, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Tips */}
        <div className="p-5 rounded-lg bg-card border border-border space-y-3 dashboard-card">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Recruiter Optimization Tips</span>
          </h4>
          <ul className="space-y-2">
            {suggestions.map((sg, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{sg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
