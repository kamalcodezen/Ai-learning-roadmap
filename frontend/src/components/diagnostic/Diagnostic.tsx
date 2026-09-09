"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Target,
  Mic,
  MicOff,
  Award,
  Bookmark,
  ListChecks,
  ArrowLeft,
  Edit3,
} from "lucide-react";

import { BorderBeam } from "@/src/components/ui/border-beam";
import { glowCardClass } from "@/src/components/dashboard/shared/cards";

import { authClient } from "@/src/lib/auth-client";

import {
  completeDiagnosticAttempt,
  submitDiagnosticAnswer,
  type DiagnosticCompleteResult,
} from "@/src/lib/actions/learner/diagnostic";
import {
  getDiagnosticQuestions,
  getLatestDiagnosticResult,
  type DiagnosticQuestion,
} from "@/src/lib/api/learner/diagnostic";
import DiagnosticResultView from "./DiagnosticResultView";

type DiagnosticStatus =
  | "idle"
  | "loading"
  | "ready"
  | "submitting"
  | "completed"
  | "error";

export default function Diagnostic() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  const [result, setResult] = useState<DiagnosticCompleteResult | null>(null);

  const [status, setStatus] = useState<DiagnosticStatus>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  // TanStack Query: Fetch latest completed diagnostic result if available
  const { data: latestResultResponse } = useQuery({
    queryKey: ["latestDiagnosticResult", session?.user?.id],
    queryFn: async () => {
      try {
        const res = await getLatestDiagnosticResult();
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!session?.user?.id && status === "idle",
    staleTime: 1000 * 60 * 5,
  });

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Cleanup speech recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    try {
      interface SpeechRecognitionLike {
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: {
          results: {
            [index: number]: { [index: number]: { transcript: string } | undefined } | undefined;
            length: number;
          };
        }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      }

      const recog = new SpeechRecognition() as SpeechRecognitionLike;
      recog.continuous = true;
      recog.interimResults = true;

      const initialText = selectedAnswer;

      recog.onresult = (event) => {
        let transcript = "";
        if (event.results) {
          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item[0] && typeof item[0].transcript === "string") {
              transcript += item[0].transcript;
            }
          }
        }

        const separator = initialText && transcript && !initialText.endsWith(" ") ? " " : "";
        setSelectedAnswer(initialText + separator + transcript);
      };

      recog.onerror = (event: { error: string }) => {
        if (event.error === "no-speech" || event.error === "aborted") {
          // Normal silence pauses or stop — do not show errors or log console error
          return;
        }

        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access denied. Please allow it in your browser settings.");
          setIsRecording(false);
        } else if (event.error === "network") {
          setErrorMessage("Network error with speech recognition.");
          setIsRecording(false);
        } else {
          setErrorMessage("Microphone error: " + event.error);
          setIsRecording(false);
        }
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recog.start();
      recognitionRef.current = recog;
      setIsRecording(true);
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not start microphone.");
      setIsRecording(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const isLastQuestion =
    questions.length > 0 && currentQuestionIndex === questions.length - 1;

  const progress =
    questions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
      : 0;

  // ============================================================
  // START DIAGNOSTIC
  // ============================================================

  async function handleStartDiagnostic() {
    const userId = session?.user?.id;

    if (!userId || status === "loading") {
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      // --------------------------------------------------------
      // 1. FETCH EXACTLY 6 QUESTIONS (Backend creates attempt if needed)
      // --------------------------------------------------------

      const questionsResponse = await getDiagnosticQuestions(userId, 6);

      const fetchedQuestions = questionsResponse.data;

      if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length !== 6) {
        throw new Error(
          `Expected 6 diagnostic questions, but received ${fetchedQuestions?.length ?? 0}.`,
        );
      }

      // getDiagnosticQuestions returns questions that have the attemptId attached
      const activeAttemptId = (
        fetchedQuestions[0] as DiagnosticQuestion & { attemptId?: string }
      ).attemptId;

      if (!activeAttemptId) {
        throw new Error(
          "Could not determine active attempt ID from questions.",
        );
      }

      setAttemptId(activeAttemptId);

      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer("");

      setStatus("ready");
    } catch (error: unknown) {
      console.error("Failed to start diagnostic:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Failed to start diagnostic.",
      );

      setStatus("error");
    }
  }

  const toggleBookmark = (index: number) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleJumpToQuestion = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    if (selectedAnswer) {
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));
    }
    setCurrentQuestionIndex(targetIndex);
    setSelectedAnswer(answersMap[targetIndex] || "");
    setIsReviewing(false);
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleOpenReview = () => {
    if (selectedAnswer) {
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));
      if (attemptId && currentQuestion) {
        submitDiagnosticAnswer(attemptId, {
          questionId: currentQuestion.id,
          selectedAnswer,
        }).catch((err) => console.error("Auto-save answer error:", err));
      }
    }
    setIsReviewing(true);
  };

  async function handleFinalSubmit() {
    if (!attemptId || status === "submitting") return;
    try {
      setStatus("submitting");
      setErrorMessage("");

      const completeResponse = await completeDiagnosticAttempt(attemptId);

      if (session?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ["dashboardData", session.user.id] });
        queryClient.invalidateQueries({ queryKey: ["careerTwin", session.user.id] });
        queryClient.invalidateQueries({ queryKey: ["skillGaps", session.user.id] });
        queryClient.invalidateQueries({ queryKey: ["learningPath", session.user.id] });
        queryClient.invalidateQueries({ queryKey: ["proofGraph", session.user.id] });
      }

      setResult(completeResponse.data);
      setStatus("completed");
      setIsReviewing(false);
    } catch (error: unknown) {
      console.error("Failed to complete diagnostic:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to complete diagnostic.",
      );
      setStatus("ready");
    }
  }

  // ============================================================
  // SUBMIT ANSWER / NEXT
  // ============================================================

  async function handleNext() {
    if (
      !attemptId ||
      !currentQuestion ||
      !selectedAnswer ||
      status === "submitting"
    ) {
      return;
    }

    try {
      setStatus("submitting");
      setErrorMessage("");

      // --------------------------------------------------------
      // SAVE ANSWER
      // --------------------------------------------------------

      await submitDiagnosticAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedAnswer,
      });

      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));

      // --------------------------------------------------------
      // COMPLETE AFTER QUESTION 5 -> SHOW REVIEW SHEET
      // --------------------------------------------------------

      if (isLastQuestion) {
        setIsReviewing(true);
        setStatus("ready");
        return;
      }

      // --------------------------------------------------------
      // NEXT QUESTION
      // --------------------------------------------------------

      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(answersMap[nextIndex] || "");

      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }

      setStatus("ready");
    } catch (error: unknown) {
      console.error("Failed to submit diagnostic answer:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit your answer.",
      );

      setStatus("ready");
    }
  }

  // ============================================================
  // SESSION LOADING
  // ============================================================

  if (isSessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your diagnostic...
        </div>
      </main>
    );
  }

  // ============================================================
  // AUTH REQUIRED
  // ============================================================

  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className={`w-full max-w-lg ${glowCardClass} p-8 text-center`}>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>

          <h1 className="text-xl font-semibold">Sign in required</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Please sign in before starting your diagnostic.
          </p>

          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90"
          >
            Go to Sign In
          </button>
        </section>
      </main>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className={`w-full max-w-lg ${glowCardClass} p-8 text-center`}>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
            <Target className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="text-xl font-semibold">Unable to generate your diagnostic right now.</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {errorMessage || "An unexpected issue occurred while preparing your personalized questions. Please retry."}
          </p>

          <button
            type="button"
            onClick={() => void handleStartDiagnostic()}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90 active:scale-[0.98]"
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  // ============================================================
  // COMPLETED
  // ============================================================

  if (status === "completed" && result) {
    return (
      <DiagnosticResultView
        result={result}
        onRetake={() => {
          setStatus("idle");
          setResult(null);
          setCurrentQuestionIndex(0);
          setSelectedAnswer("");
        }}
      />
    );
  }

  // ============================================================
  // START SCREEN
  // ============================================================

  if (status === "idle") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-280px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

          <div className="absolute -left-64 top-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[100px]" />

          <div className="absolute -right-64 bottom-[10%] h-[500px] w-[500px] rounded-full bg-primary/[0.025] blur-[100px]" />
        </div>

        <section className={`relative z-10 w-full max-w-2xl ${glowCardClass} p-8 text-center sm:p-12`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            AI Pather Diagnostic
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Discover your current skill level.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Answer 5 multiple-choice questions and 1 open-ended communication question based on your current knowledge. Your result will
            help AI Pather understand your starting point.
          </p>

          {/* Previous result shortcut if available */}
          {latestResultResponse && (
            <div className="mx-auto mt-6 flex max-w-md items-center justify-between rounded-2xl border border-primary/20 bg-primary/[0.05] p-4 text-left">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Previous Assessment
                </span>
                <p className="text-sm font-bold text-foreground">
                  Score: {latestResultResponse.overallScore ?? latestResultResponse.score}% ({latestResultResponse.correctAnswers ?? 0}/{latestResultResponse.mcqCount ?? 5} MCQ correct)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResult(latestResultResponse);
                  setStatus("completed");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-2 text-xs font-semibold transition"
              >
                <Award className="h-3.5 w-3.5" />
                View Results
              </button>
            </div>
          )}

          <div className="mx-auto mt-8 grid max-w-md gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card-soft p-4">
              <p className="text-lg font-bold">6</p>
              <p className="mt-1 text-xs text-muted-foreground">Questions</p>
            </div>

            <div className="rounded-xl border border-border bg-card-soft p-4">
              <p className="text-lg font-bold">Mixed</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Question type
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card-soft p-4">
              <p className="text-lg font-bold">~2 min</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimated time
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleStartDiagnostic()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] w-full sm:w-auto"
            >
              {latestResultResponse ? "Start New Diagnostic" : "Start Diagnostic"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // LOADING QUESTIONS
  // ============================================================

  if (status === "loading" || !currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating your personalized diagnostic...
        </div>
      </main>
    );
  }

  // ============================================================
  // DIAGNOSTIC QUESTIONS
  // ============================================================

  if (isReviewing) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                    Diagnostic Review
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    Review Before Final Submission
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Questions
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Review your responses below. You can jump back to any question to adjust your answers or manage bookmarks before finalizing.
            </p>
          </header>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const ans = answersMap[idx];
              const isBookmarked = bookmarkedQuestions.includes(idx);
              return (
                <div
                  key={q.id || idx}
                  className={`${glowCardClass} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-primary">
                        Question {idx + 1} ({q.category})
                      </span>
                      {isBookmarked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Bookmark className="w-2.5 h-2.5" /> Bookmarked
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {q.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      <span className="font-semibold text-foreground/80">Your Response: </span>
                      {ans ? ans : <span className="text-amber-500 italic">Not yet answered</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(idx)}
                      className={`p-2 rounded-xl border transition ${
                        isBookmarked
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-card-soft border border-border hover:bg-muted text-foreground transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/[0.04]">
            <div>
              <p className="text-sm font-bold text-foreground">Ready to calculate your skill profile?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Object.keys(answersMap).length} of {questions.length} questions answered.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition"
              >
                Continue Answering
              </button>
              <button
                type="button"
                disabled={status === "submitting"}
                onClick={() => void handleFinalSubmit()}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-primary hover:opacity-95 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing & Finalizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit Diagnostic</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

        <div className="absolute -left-64 top-[35%] h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[100px]" />

        <div className="absolute -right-64 bottom-[10%] h-[500px] w-[500px] rounded-full bg-primary/[0.025] blur-[100px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}

        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                AI Pather Diagnostic
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Let&apos;s understand where you are.
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Answer these questions based on what you know today. There are no
            tricks—this helps AI Pather understand your starting point.
          </p>
        </header>

        {/* Progress & Navigation Strip */}

        <div className={`mb-6 ${glowCardClass} p-4 space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!answersMap[idx];
                const isBookmarked = bookmarkedQuestions.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`relative w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/40 shadow-sm"
                        : isAnswered
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {idx + 1}
                    {isBookmarked && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark(currentQuestionIndex)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  bookmarkedQuestions.includes(currentQuestionIndex)
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{bookmarkedQuestions.includes(currentQuestionIndex) ? "Bookmarked" : "Bookmark"}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenReview}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Review ({Object.keys(answersMap).length}/6)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>

            <span className="text-muted-foreground">{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}

        <section className={`${glowCardClass} p-6 sm:p-8`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary">
              {currentQuestion.category}
            </span>

            <span className="rounded-full border border-border bg-card-soft px-3 py-1 text-xs font-medium text-muted-foreground">
              {currentQuestion.difficulty}
            </span>

            <span className="rounded-full border border-border bg-card-soft px-3 py-1 text-xs font-medium text-muted-foreground">
              {currentQuestion.skill}
            </span>
          </div>

          <h2 className="mt-6 text-xl font-semibold leading-8 sm:text-2xl">
            {currentQuestion.question}
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {currentQuestion.description}
          </p>

          <div className="mt-8 space-y-3">
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option) => {
                const selected = selectedAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={status === "submitting"}
                    onClick={() => setSelectedAnswer(option)}
                    className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-2 border-background bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)] overflow-hidden"
                        : "border border-[#E6E9EE] bg-white dark:border-[rgba(159,84,247,0.15)] dark:bg-[#1a0e2e]"
                    }`}
                  >
                    {selected && (
                      <>
                        <BorderBeam
                          duration={6}
                          size={100}
                          borderWidth={2}
                          className="from-transparent via-[#9F54F7] to-transparent"
                        />
                        <BorderBeam
                          duration={6}
                          delay={3}
                          size={100}
                          borderWidth={2}
                          className="from-transparent via-[#c084fc] to-transparent"
                        />
                      </>
                    )}

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                        selected
                          ? "border-brand/500 bg-primary text-white"
                          : "border-border text-transparent"
                      }`}
                    >
                      {selected && <CheckCircle2 className="h-4 w-4" />}
                    </span>

                    <span className="text-sm font-medium leading-6">
                      {option}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-card-soft rounded-t-xl border border-b-0 border-border p-4">
                   <p className="text-sm font-medium text-foreground">Record your answer, or type it below.</p>
                   <button
                     type="button"
                     onClick={toggleRecording}
                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isRecording ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                   >
                     {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                     {isRecording ? "Stop Recording" : "Start Recording"}
                   </button>
                </div>
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Your answer will appear here..."
                  disabled={status === "submitting"}
                  className="min-h-[200px] w-full resize-y rounded-b-xl rounded-t-none border border-border bg-background p-4 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
            )}
          </div>

          {/* Error */}

          {errorMessage && (
            <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {/* Action */}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              {currentQuestionIndex > 0 ? (
                <button
                  type="button"
                  disabled={status === "submitting"}
                  onClick={() => handleJumpToQuestion(currentQuestionIndex - 1)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card-soft px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleOpenReview}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card-soft px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition hover:bg-muted cursor-pointer"
              >
                <ListChecks className="h-3.5 w-3.5" />
                Review Sheet
              </button>
            </div>

            <button
              type="button"
              disabled={!selectedAnswer || status === "submitting"}
              onClick={() => void handleNext()}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : isLastQuestion ? (
                <>
                  Review & Submit
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
