"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Wand2,
  Sparkles,
  Compass,
  Award,
  X,
  Calendar,
  AlertCircle,
  BookOpen,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import {
  startInterview,
  submitInterviewAnswer,
  completeInterview,
  getInterviewHistory,
} from "@/src/lib/actions/learner/interview";
import { getDashboardOverview } from "@/src/lib/api/learner/dashboard";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { InterviewLobby } from "./InterviewLobby";
import { InterviewLiveRoom } from "./InterviewLiveRoom";
import { InterviewScorecard, QuestionAnswerPair, EvaluationData } from "./InterviewScorecard";
import BrandLoader from "@/src/components/shared/BrandLoader";

type InterviewView = "lobby" | "generating" | "live_room" | "scorecard" | "error";

interface QuestionItem {
  id: string;
  question: string;
  order: number;
  category?: string;
  skillFocus?: string;
}

const PLAYFUL_MESSAGES = [
  { text: "Analyzing your engineering stack and role...", icon: Brain },
  { text: "Curating scenario-based interview challenges...", icon: Wand2 },
  { text: "Synthesizing deep system architecture questions...", icon: Sparkles },
  { text: "Calibrating rubric across 5 evaluation dimensions...", icon: Compass },
];

export default function Interview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const [view, setView] = useState<InterviewView>("lobby");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Track answers and evaluations for the scorecard
  const [answersMap, setAnswersMap] = useState<Record<string, { answerText: string; evaluation?: EvaluationData }>>({});
  const [completedResult, setCompletedResult] = useState<{
    finalScore: number;
    questionsWithAnswers: QuestionAnswerPair[];
  } | null>(null);

  // Fetch learner's dashboard data for targetRole and experienceLevel
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardData", session?.user?.id],
    queryFn: () => getDashboardOverview(),
    enabled: !!session?.user?.id,
  });

  const targetRole =
    dashboardData?.career?.targetRole ||
    "Software Engineer";
  const experienceLevel = dashboardData?.career?.experienceLevel || "Mid Level";

  // History Review Modal
  const [selectedHistorySession, setSelectedHistorySession] = useState<{
    id: string;
    targetRole?: string;
    score?: number;
    completedAt?: string;
    questionsCount?: number;
    answersCount?: number;
    questions: Array<{ id: string; question: string; order: number; category?: string }>;
    answers: Array<{
      id: string;
      questionId: string;
      answerText: string;
      evaluation?: {
        technicalKnowledge?: number;
        problemSolving?: number;
        clarity?: number;
        communication?: number;
        practicalUnderstanding?: number;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
        idealAnswer?: string;
      };
    }>;
  } | null>(null);

  // Playful generator message interval
  useEffect(() => {
    if (view !== "generating") return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PLAYFUL_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [view]);

  // Fetch past interview history
  const { data: historyData } = useQuery({
    queryKey: ["interviewHistory", session?.user?.id],
    queryFn: async () => {
      const res = await getInterviewHistory();
      return (res?.data || []) as Array<{
        id: string;
        targetRole?: string;
        score?: number;
        completedAt?: string;
        questionsCount?: number;
        answersCount?: number;
        questions: Array<{ id: string; question: string; order: number; category?: string }>;
        answers: Array<{
          id: string;
          questionId: string;
          answerText: string;
          evaluation?: {
            technicalKnowledge?: number;
            problemSolving?: number;
            clarity?: number;
            communication?: number;
            practicalUnderstanding?: number;
            feedback?: string;
            strengths?: string[];
            improvements?: string[];
            idealAnswer?: string;
          };
        }>;
      }>;
    },
    enabled: !!session?.user?.id && (view === "lobby" || view === "scorecard"),
  });

  // 1. Handle Start Interview from Lobby
  const handleStartInterview = async (options: { mode: string; questionCount: number }) => {
    if (!session?.user?.id || isSubmitting) return;

    try {
      setView("generating");
      setErrorMessage("");
      setAnswersMap({});
      setCompletedResult(null);

      const response = await startInterview({
        mode: options.mode,
        questionCount: options.questionCount,
      });

      if (!response.data || !response.data.questions || response.data.questions.length === 0) {
        throw new Error("Failed to generate interview session. Please try again.");
      }

      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setView("live_room");
    } catch (error: unknown) {
      console.error("Failed to start interview session:", error);
      const err = error as { message?: string };
      setErrorMessage(err?.message || "Failed to start interview. Please try again.");
      setView("error");
    }
  };

  // 2. Handle Submitting Question Answer
  const handleAnswerSubmit = async (answerText: string) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const answerRes = await submitInterviewAnswer({
        questionId: currentQ.id,
        answerText,
      });

      // Update local answers map with evaluation if returned
      const evalData = (answerRes?.data?.evaluation || answerRes?.evaluation) as EvaluationData | undefined;
      setAnswersMap((prev) => ({
        ...prev,
        [currentQ.id]: {
          answerText,
          evaluation: evalData,
        },
      }));

      const isLast = currentQuestionIndex === questions.length - 1;

      if (isLast) {
        // Complete the interview session
        const completeRes = await completeInterview();
        const finalScore = completeRes?.data?.finalScore ?? completeRes?.finalScore ?? 78;
        const completedSession = completeRes?.data?.session || completeRes?.session;

        // Invalidate relevant query caches
        if (session?.user?.id) {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", session.user.id] });
          queryClient.invalidateQueries({ queryKey: ["careerTwin", session.user.id] });
          queryClient.invalidateQueries({ queryKey: ["interviewHistory", session.user.id] });
          queryClient.invalidateQueries({ queryKey: ["applicationReadiness", session.user.id] });
          queryClient.invalidateQueries({ queryKey: ["readiness", session.user.id] });
        }

        // Build QuestionAnswerPair list
        const pairs: QuestionAnswerPair[] = questions.map((q) => {
          const matchedAnswer = (completedSession?.answers as Array<{ questionId: string; answerText?: string; evaluation?: EvaluationData }> | undefined)?.find(
            (a) => a.questionId === q.id
          );
          const localRecord = answersMap[q.id];

          return {
            id: q.id,
            question: q.question,
            order: q.order,
            category: q.category,
            answerText: matchedAnswer?.answerText || localRecord?.answerText || (q.id === currentQ.id ? answerText : ""),
            evaluation: matchedAnswer?.evaluation || localRecord?.evaluation || evalData,
          };
        });

        setCompletedResult({
          finalScore,
          questionsWithAnswers: pairs,
        });

        setView("scorecard");
      } else {
        // Advance to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error: unknown) {
      console.error("Failed to submit answer:", error);
      const err = error as { message?: string };
      setErrorMessage(err?.message || "Failed to submit your response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Early Termination handler - triggers custom modal
  const handleEndEarly = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsExitModalOpen(false);
    setView("lobby");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswersMap({});
  };

  // View Past Session Transcript
  const handleViewHistorySession = (sessionId: string) => {
    const found = historyData?.find((s) => s.id === sessionId);
    if (found) {
      setSelectedHistorySession(found);
    }
  };

  // Session loading screen
  if (isSessionLoading) {
    return <BrandLoader message="Loading your mock interview studio..." />;
  }

  // Not signed in
  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="dashboard-card w-full max-w-lg text-center space-y-4">
          <h1 className="text-xl font-bold text-foreground">Sign In Required</h1>
          <p className="text-xs text-muted-foreground">
            Please log in to your account to access the AI Mock Interview system.
          </p>
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer"
          >
            Go to Sign In
          </button>
        </section>
      </main>
    );
  }

  // Error State
  if (view === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="dashboard-card w-full max-w-lg text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Interview Session Error</h1>
          <p className="text-sm text-foreground/80">{errorMessage || "An unexpected error occurred."}</p>
          <button
            type="button"
            onClick={() => {
              setView("lobby");
              setErrorMessage("");
            }}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer"
          >
            Return to Lobby
          </button>
        </section>
      </main>
    );
  }

  // Generating Screen
  if (view === "generating") {
    const ActiveIcon = PLAYFUL_MESSAGES[messageIndex].icon;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          {/* Animated Glowing Icon Badge */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-lg border border-primary/30 transition-all duration-500 ease-out">
              <ActiveIcon className="h-9 w-9 animate-bounce transition-transform duration-300" />
            </div>
          </div>

          {/* Dynamic Playful Text */}
          <div className="space-y-1.5">
            <p className="text-base font-bold text-foreground transition-opacity duration-300 animate-pulse">
              {PLAYFUL_MESSAGES[messageIndex].text}
            </p>
            <p className="text-xs text-muted-foreground">
              Preparing your live scenario interview room...
            </p>
          </div>

          {/* Shimmering Progress Bar */}
          <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full bg-primary animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // Live Interview Room
  if (view === "live_room" && questions.length > 0) {
    return (
      <main className="min-h-screen w-full px-4 py-8 max-w-5xl mx-auto">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <InterviewLiveRoom
          targetRole={targetRole}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          onAnswerSubmit={handleAnswerSubmit}
          onEndEarly={handleEndEarly}
          isSubmitting={isSubmitting}
        />

        {/* Custom Exit Confirmation Modal */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div
              className="dashboard-card !bg-card text-foreground border-2 border-border shadow-2xl w-full max-w-md !p-6 animate-in zoom-in-95 space-y-5 text-center relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-modal-title"
            >
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              <div className="space-y-2">
                <h3 id="exit-modal-title" className="text-lg font-bold text-foreground tracking-tight">
                  Exit Interview Session?
                </h3>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-xs mx-auto">
                  Are you sure you want to exit the interview session? Progress will be lost.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card-soft hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // Executive Scorecard Screen
  if (view === "scorecard" && completedResult) {
    return (
      <main className="min-h-screen w-full px-4 py-8 max-w-5xl mx-auto">
        <InterviewScorecard
          targetRole={targetRole}
          finalScore={completedResult.finalScore}
          questionsWithAnswers={completedResult.questionsWithAnswers}
          onRetake={() => {
            setView("lobby");
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setAnswersMap({});
            setCompletedResult(null);
          }}
          onReturnDashboard={() => router.push("/dashboard/learner")}
        />
      </main>
    );
  }

  // Default: Interview Lobby
  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-5xl mx-auto space-y-8">
      <InterviewLobby
        targetRole={targetRole}
        experienceLevel={experienceLevel}
        onStart={handleStartInterview}
        isLoading={isSubmitting}
        historyData={historyData}
        onViewHistorySession={handleViewHistorySession}
      />

      {/* TRANSCRIPT & EVALUATION REVIEW MODAL */}
      {selectedHistorySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="dashboard-card !bg-card text-foreground border-2 border-border w-full max-w-3xl my-8 max-h-[88vh] flex flex-col !p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-primary" /> Session Transcript & Feedback
                </h3>
                <div className="flex items-center gap-2 text-xs text-foreground/70 mt-1">
                  <span className="font-semibold text-foreground">
                    {selectedHistorySession.targetRole || "Technical Role"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedHistorySession.completedAt
                      ? new Date(selectedHistorySession.completedAt).toLocaleDateString()
                      : "Recent"}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-500 font-bold">
                    Score: {selectedHistorySession.score}%
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistorySession(null)}
                className="p-1.5 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 py-4 pr-1">
              {selectedHistorySession.questions.map((q, idx) => {
                const ans = selectedHistorySession.answers.find((a) => a.questionId === q.id);
                const evalData = ans?.evaluation;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-border/80 bg-card-soft space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary/15 text-primary shrink-0">
                        Q{idx + 1}
                      </span>
                      <p className="font-bold text-sm text-foreground flex-1 leading-snug">
                        {q.question}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-background border border-border">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 block mb-1">
                        Candidate Answer:
                      </span>
                      <p className="text-xs text-foreground font-normal leading-relaxed whitespace-pre-wrap">
                        {ans?.answerText || "No recorded response."}
                      </p>
                    </div>

                    {evalData && (
                      <div className="space-y-2.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                          5-Dimension Rubric Breakdown:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {evalData.technicalKnowledge !== undefined && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="text-[11px] text-foreground/70 block">Tech Knowledge</span>
                              <span className="font-bold text-foreground text-sm">{evalData.technicalKnowledge}%</span>
                            </div>
                          )}
                          {evalData.problemSolving !== undefined && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="text-[11px] text-foreground/70 block">Problem Solving</span>
                              <span className="font-bold text-foreground text-sm">{evalData.problemSolving}%</span>
                            </div>
                          )}
                          {evalData.clarity !== undefined && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="text-[11px] text-foreground/70 block">Clarity</span>
                              <span className="font-bold text-foreground text-sm">{evalData.clarity}%</span>
                            </div>
                          )}
                          {evalData.communication !== undefined && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="text-[11px] text-foreground/70 block">Communication</span>
                              <span className="font-bold text-foreground text-sm">{evalData.communication}%</span>
                            </div>
                          )}
                          {evalData.practicalUnderstanding !== undefined && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="text-[11px] text-foreground/70 block">Practical</span>
                              <span className="font-bold text-foreground text-sm">{evalData.practicalUnderstanding}%</span>
                            </div>
                          )}
                        </div>

                        {evalData.feedback && (
                          <p className="text-xs text-foreground font-medium italic bg-primary/10 p-3.5 rounded-xl border border-primary/25 leading-relaxed">
                            {evalData.feedback}
                          </p>
                        )}

                        {evalData.idealAnswer && (
                          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 space-y-1">
                            <span className="text-xs font-bold text-primary flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-primary" /> Staff Engineer Ideal Answer:
                            </span>
                            <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {evalData.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedHistorySession(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}