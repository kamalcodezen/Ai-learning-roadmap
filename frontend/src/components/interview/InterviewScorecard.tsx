"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Brain,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  BookOpen,
} from "lucide-react";

export interface EvaluationData {
  technicalKnowledge?: number;
  problemSolving?: number;
  clarity?: number;
  communication?: number;
  practicalUnderstanding?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  idealAnswer?: string;
}

export interface QuestionAnswerPair {
  id: string;
  question: string;
  order: number;
  category?: string;
  answerText?: string;
  evaluation?: EvaluationData;
}

interface InterviewScorecardProps {
  targetRole: string;
  finalScore: number;
  questionsWithAnswers: QuestionAnswerPair[];
  onRetake: () => void;
  onReturnDashboard: () => void;
}

export function InterviewScorecard({
  targetRole,
  finalScore,
  questionsWithAnswers,
  onRetake,
  onReturnDashboard,
}: InterviewScorecardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Compute average rubric scores across evaluated answers
  const validEvaluations = questionsWithAnswers
    .map((q) => q.evaluation)
    .filter((e): e is EvaluationData => Boolean(e));

  const count = validEvaluations.length || 1;
  const avgTech = Math.round(
    validEvaluations.reduce((sum, e) => sum + (e.technicalKnowledge ?? 75), 0) / count
  );
  const avgProblem = Math.round(
    validEvaluations.reduce((sum, e) => sum + (e.problemSolving ?? 75), 0) / count
  );
  const avgClarity = Math.round(
    validEvaluations.reduce((sum, e) => sum + (e.clarity ?? 75), 0) / count
  );
  const avgPractical = Math.round(
    validEvaluations.reduce((sum, e) => sum + (e.practicalUnderstanding ?? 75), 0) / count
  );
  const avgComm = Math.round(
    validEvaluations.reduce((sum, e) => sum + (e.communication ?? 75), 0) / count
  );

  // Aggregate strengths and improvements
  const allStrengths = Array.from(
    new Set(validEvaluations.flatMap((e) => e.strengths || []))
  );
  const allImprovements = Array.from(
    new Set(validEvaluations.flatMap((e) => e.improvements || []))
  );

  const getVerdict = (score: number) => {
    if (score >= 80) {
      return {
        label: "Job Ready • Strong Hire",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        description: "Your responses demonstrate strong senior architectural depth and clear problem solving.",
      };
    }
    if (score >= 60) {
      return {
        label: "Developing • Promising Candidate",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        description: "Solid conceptual foundation. Sharpen edge-case analysis and real-world performance tradeoffs.",
      };
    }
    return {
      label: "Needs Practice",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      description: "Focus on structuring answers with concrete production examples and the STAR methodology.",
    };
  };

  const verdict = getVerdict(finalScore);

  const RUBRIC_METRICS = [
    { label: "Technical Knowledge", score: avgTech, color: "bg-primary" },
    { label: "Problem Solving & Complexity", score: avgProblem, color: "bg-sky-500" },
    { label: "Structural Clarity", score: avgClarity, color: "bg-emerald-500" },
    { label: "Practical Engineering Depth", score: avgPractical, color: "bg-amber-500" },
    { label: "Communication & Articulation", score: avgComm, color: "bg-indigo-500" },
  ];

  return (
    <div className="w-full flex flex-col dashboard-card-gap animate-in fade-in duration-500">
      {/* Executive Hero Banner */}
      <div className="dashboard-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Executive Scorecard
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${verdict.color}`}>
              {verdict.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Mock Interview Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Target Role: <span className="font-semibold text-foreground">{targetRole}</span> •{" "}
            {questionsWithAnswers.length} Questions Evaluated
          </p>
          <p className="text-xs text-muted-foreground pt-1">{verdict.description}</p>
        </div>

        {/* Circular Score HUD */}
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-card-soft border border-border shadow-inner min-w-[170px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Overall Score
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-5xl font-black text-primary">
              {finalScore}
            </span>
            <span className="text-sm font-bold text-muted-foreground">%</span>
          </div>
          <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3" /> Skill Boost Applied
          </span>
        </div>
      </div>

      {/* 5-Dimension Competency Rubric Grid */}
      <div className="dashboard-card space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span>Core Evaluation Rubric (5 Dimensions)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
          {RUBRIC_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="p-3.5 rounded-lg bg-card-soft border border-border space-y-2"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground">{metric.label}</span>
                <span className="font-bold text-foreground">{metric.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${metric.color} transition-all duration-700 rounded-full`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Actionable Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        <div className="dashboard-card space-y-3 border-emerald-500/30">
          <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Demonstrated Strengths
          </h3>
          <ul className="space-y-2">
            {(allStrengths.length > 0 ? allStrengths : ["Structured logical flow", "Technical articulation"]).map(
              (item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="dashboard-card space-y-3 border-amber-500/30">
          <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Actionable Next Steps
          </h3>
          <ul className="space-y-2">
            {(allImprovements.length > 0
              ? allImprovements
              : ["Incorporate explicit time/space complexity tradeoffs", "Reference concrete observability tools"]
            ).map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question Breakdown with Staff Engineer Ideal Answers */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <span>Detailed Question Transcripts & Model Answers</span>
          </h2>
          <span className="text-xs text-muted-foreground">Click question to expand</span>
        </div>

        <div className="space-y-3">
          {questionsWithAnswers.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const evalData = item.evaluation;

            return (
              <div
                key={item.id || idx}
                className="dashboard-card !p-0 overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        Question {idx + 1}
                      </span>
                      {item.category && (
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-foreground leading-snug">
                      {item.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-border bg-card-soft space-y-4">
                    {/* Learner Answer Transcript */}
                    <div className="p-4 rounded-lg bg-background border border-border space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Your Spoken / Submitted Response:
                      </span>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {item.answerText || "No response recorded."}
                      </p>
                    </div>

                    {/* AI Feedback & Rubric */}
                    {evalData && (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-lg bg-primary/[0.04] border border-primary/20 space-y-1">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> AI Evaluator Feedback:
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {evalData.feedback || "Good technical coverage."}
                          </p>
                        </div>

                        {/* Staff Engineer Model Answer */}
                        {evalData.idealAnswer && (
                          <div className="p-4 rounded-lg bg-primary/10 border border-primary/25 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                Staff Engineer Ideal Model Answer:
                              </span>
                              <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                                Best Practice
                              </span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                              {evalData.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof Graph / Skill Verification Notice */}
      <div className="dashboard-card !p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Proof Graph Verified</h4>
            <p className="text-[11px] text-muted-foreground">
              This session has boosted your practice competencies in your personalized Proof Graph.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>New Simulation</span>
          </button>

          <button
            type="button"
            onClick={onReturnDashboard}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <span>Return to Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
