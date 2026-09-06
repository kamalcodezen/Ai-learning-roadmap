"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getSkillSimulation,
  submitSkillSimulation,
  getSkillSimulationResult,
  SimulationResultData
} from "@/src/lib/api/learner/assessments";
import { Card, CardContent } from "@/src/components/ui/Card";
import SkillSimulationResultView from "./SkillSimulationResultView";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Bug,
  Code2,
  MessageSquareText,
  Send,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Props {
  skill: string;
  initialReviewMode?: boolean;
}

export default function SkillSimulationView({ skill, initialReviewMode = false }: Props) {
  const queryClient = useQueryClient();
  const { data: session } = useDashboardSession();

  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(initialReviewMode);

  const [understandAnswer, setUnderstandAnswer] = useState<string>("");
  const [debugAnswer, setDebugAnswer] = useState<string>("");
  const [codeAnswer, setCodeAnswer] = useState<string>("");
  const [explainAnswer, setExplainAnswer] = useState<string>("");

  const [submittedResult, setSubmittedResult] = useState<SimulationResultData | null>(null);

  // Fetch simulation questions
  const {
    data: simulationData,
    isLoading: isSimulationLoading,
    isError: isSimulationError,
    refetch: refetchSimulation
  } = useQuery({
    queryKey: ["skillSimulation", skill],
    queryFn: () => getSkillSimulation(skill),
    enabled: !isReviewMode && !!skill,
    staleTime: 1000 * 60 * 30, // 30m cache
  });

  // Fetch previous result if in review mode
  const {
    data: reviewResult,
    isLoading: isReviewLoading,
    isError: isReviewError,
  } = useQuery({
    queryKey: ["skillSimulationResult", session?.user?.id, skill],
    queryFn: () => getSkillSimulationResult(skill),
    enabled: isReviewMode && !!session?.user?.id && !!skill,
    retry: false,
  });

  // Derived effective code with starterCode fallback (prevents cascading renders)
  const effectiveCode = codeAnswer !== "" ? codeAnswer : (simulationData?.stages?.code?.starterCode || "");

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: (payload: {
      understandAnswer: string;
      debugAnswer: string;
      codeAnswer: string;
      explainAnswer: string;
    }) => submitSkillSimulation({ skill, answers: payload }),
    onSuccess: (data) => {
      setSubmittedResult(data);
      // Invalidate all dependent queries for full-system reactive propagation
      queryClient.invalidateQueries({ queryKey: ["assessments", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["skillGaps", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerDecision", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["evidenceVerification", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerAlignment", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["readiness", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["progress", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["proofGraph", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["applicationReadiness", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["jobReality", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["skillTree", session?.user?.id] });
    }
  });

  const handleRetake = () => {
    setSubmittedResult(null);
    setIsReviewMode(false);
    setCurrentStage(0);
    setUnderstandAnswer("");
    setDebugAnswer("");
    setCodeAnswer(simulationData?.stages?.code?.starterCode || "");
    setExplainAnswer("");
  };

  // If in review mode or already submitted, show result view
  const activeResult = submittedResult || (isReviewMode ? reviewResult : null);
  if (activeResult) {
    return <SkillSimulationResultView result={activeResult} onRetake={handleRetake} />;
  }

  if (isSimulationLoading || (isReviewMode && isReviewLoading)) {
    return <GenericPageSkeleton />;
  }

  if (isReviewMode && (isReviewError || !reviewResult)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h3 className="text-lg font-bold text-foreground">No Prior Result Found</h3>
        <p className="text-sm text-muted-foreground">
          You have not completed an evaluation for {skill} yet. Start a new simulation below.
        </p>
        <button
          onClick={() => setIsReviewMode(false)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110"
        >
          Start Simulation
        </button>
      </div>
    );
  }

  if (isSimulationError || !simulationData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h3 className="text-lg font-bold text-destructive">Unable to Generate Assessment</h3>
        <p className="text-sm text-muted-foreground">
          Unable to generate your personalized assessment right now. Please click below to retry.
        </p>
        <button
          onClick={() => refetchSimulation()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stages } = simulationData;

  const stageTitles = [
    { title: "Understand", icon: BookOpen },
    { title: "Debug", icon: Bug },
    { title: "Code", icon: Code2 },
    { title: "Explain", icon: MessageSquareText }
  ];

  const isCurrentStageAnswered = () => {
    switch (currentStage) {
      case 0: return understandAnswer.trim().length > 0;
      case 1: return debugAnswer.trim().length > 0;
      case 2: return effectiveCode.trim().length > 10;
      case 3: return explainAnswer.trim().length > 10;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStage < 3) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStage > 0) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      understandAnswer,
      debugAnswer,
      codeAnswer: effectiveCode,
      explainAnswer
    });
  };

  const progressPercent = Math.round(((currentStage + 1) / 4) * 100);

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/learner/assessments"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessments
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {skill} Mastery Simulation
          </span>
          {simulationData.targetRole && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {simulationData.targetRole}
            </span>
          )}
          {simulationData.difficulty && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase text-[10px]">
              {simulationData.difficulty}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Step {currentStage + 1} of 4: {stageTitles[currentStage].title}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {stageTitles.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={idx}
                onClick={() => {
                  // Allow jumping to completed stages
                  if (idx <= currentStage) setCurrentStage(idx);
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-primary/10 border-primary text-primary"
                    : isCompleted
                    ? "bg-muted/50 border-border text-foreground hover:bg-muted"
                    : "bg-background border-border/60 text-muted-foreground cursor-not-allowed opacity-60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate hidden sm:inline">{st.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Card */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* ================= STAGE 1: UNDERSTAND ================= */}
          {currentStage === 0 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-500">
                  Stage 1: Conceptual Understanding
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {stages.understand.title}
                </h3>
                <p className="text-sm text-foreground/90 font-medium pt-2">
                  {stages.understand.question}
                </p>
                {stages.understand.context && (
                  <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground mt-2 font-mono">
                    {stages.understand.context}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                {stages.understand.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                      understandAnswer === opt
                        ? "bg-primary/10 border-primary text-foreground font-medium shadow-sm"
                        : "bg-card hover:bg-muted/50 border-border text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="understandOption"
                      value={opt}
                      checked={understandAnswer === opt}
                      onChange={() => setUnderstandAnswer(opt)}
                      className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="leading-relaxed">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ================= STAGE 2: DEBUG ================= */}
          {currentStage === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                  Stage 2: Code Debugging & Root Cause
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {stages.debug.title}
                </h3>
                <p className="text-sm text-foreground/90 font-medium pt-2">
                  {stages.debug.question}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-xl bg-[#0d1117] border border-border p-4 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner leading-relaxed">
                <pre>{stages.debug.codeSnippet}</pre>
              </div>

              <div className="space-y-2.5 pt-2">
                {stages.debug.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                      debugAnswer === opt
                        ? "bg-primary/10 border-primary text-foreground font-medium shadow-sm"
                        : "bg-card hover:bg-muted/50 border-border text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="debugOption"
                      value={opt}
                      checked={debugAnswer === opt}
                      onChange={() => setDebugAnswer(opt)}
                      className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="leading-relaxed">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ================= STAGE 3: CODE ================= */}
          {currentStage === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-500">
                  Stage 3: Hands-On Implementation
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {stages.code.title}
                </h3>
                <p className="text-sm text-foreground/90 font-medium pt-1">
                  {stages.code.question}
                </p>
              </div>

              {/* Instructions list */}
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Implementation Requirements:
                </span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {stages.code.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Editor Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Your Code Solution:</span>
                  <span className="text-[11px] font-mono">{effectiveCode.length} characters</span>
                </label>
                <textarea
                  value={effectiveCode}
                  onChange={(e) => setCodeAnswer(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  className="w-full font-mono text-xs p-4 rounded-xl bg-[#0d1117] text-[#e6edf3] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y leading-relaxed"
                  placeholder="// Implement your solution here..."
                />
              </div>
            </div>
          )}

          {/* ================= STAGE 4: EXPLAIN ================= */}
          {currentStage === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-500">
                  Stage 4: Technical Communication
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {stages.explain.title}
                </h3>
                <p className="text-sm text-foreground/90 font-medium pt-1 leading-relaxed">
                  {stages.explain.question}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Your Technical Explanation:</span>
                  <span className="text-[11px] font-mono">{explainAnswer.length} characters</span>
                </label>
                <textarea
                  value={explainAnswer}
                  onChange={(e) => setExplainAnswer(e.target.value)}
                  rows={7}
                  className="w-full text-sm p-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y leading-relaxed"
                  placeholder={stages.explain.placeholder || "Explain clearly in your own words..."}
                />
                <p className="text-[11px] text-muted-foreground">
                  💡 Evaluated for technical clarity, depth, terminology, and practical reasoning.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {submitMutation.isError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to submit simulation. Please try again.</span>
            </div>
          )}

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <button
              onClick={handlePrev}
              disabled={currentStage === 0 || submitMutation.isPending}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-card-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentStage < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentStageAnswered()}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isCurrentStageAnswered() || submitMutation.isPending}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Evaluating Answers...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit & Evaluate
                  </>
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
