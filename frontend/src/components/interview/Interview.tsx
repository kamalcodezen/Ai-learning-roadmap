"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Loader2, Target, Mic, MicOff, History, Calendar, Award, X } from "lucide-react";
import { startInterview, submitInterviewAnswer, completeInterview, getInterviewHistory } from "@/src/lib/actions/learner/interview";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";

// generate loader effect related
import { Sparkles, Brain, Wand2, Compass } from "lucide-react";

type InterviewStatus = "idle" | "loading" | "ready" | "submitting" | "completed" | "error";





export default function Interview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const [questions, setQuestions] = useState<{id: string, question: string, [key: string]: unknown}[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState<{ finalScore: number } | null>(null);
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedHistorySession, setSelectedHistorySession] = useState<{
    id: string;
    targetRole?: string;
    score?: number;
    completedAt?: string;
    questionsCount?: number;
    answersCount?: number;
    questions: Array<{ id: string; question: string; order: number }>;
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
      };
    }>;
  } | null>(null);

  const PLAYFUL_MESSAGES = [
  { text: "Reading your mind...", icon: Brain },
  { text: "Mixing pure magic...", icon: Wand2 },
  { text: "Curating your special questions...", icon: Sparkles },
  { text: "Plotting the ultimate challenge...", icon: Compass },
];

// Generating Questions Effect loader
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PLAYFUL_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [PLAYFUL_MESSAGES.length]);

  const ActiveIcon = PLAYFUL_MESSAGES[index].icon;

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
        questions: Array<{ id: string; question: string; order: number }>;
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
          };
        }>;
      }>;
    },
    enabled: !!session?.user?.id && status === "idle",
  });
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
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
  const isLastQuestion = questions.length > 0 && currentQuestionIndex === questions.length - 1;
  const progress = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;

  async function handleStartInterview() {
    if (!session?.user?.id || status === "loading") return;
    try {
      setStatus("loading");
      setErrorMessage("");
      const response = await startInterview();
      if (!response.data || !response.data.questions) {
        throw new Error("Failed to start interview.");
      }
      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer("");
      setStatus("ready");
    } catch (error: unknown) {
      console.error("Failed to start interview:", error);
      setErrorMessage((error as Error).message || "Failed to start interview.");
      setStatus("error");
    }
  }

  async function handleNext() {
    if (!currentQuestion || !selectedAnswer || status === "submitting") return;
    try {
      setStatus("submitting");
      setErrorMessage("");

      await submitInterviewAnswer({
        questionId: currentQuestion.id,
        answerText: selectedAnswer,
      });

      if (isLastQuestion) {
        const completeResponse = await completeInterview();
        if (session?.user?.id) {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", session.user.id] });
          queryClient.invalidateQueries({ queryKey: ["careerTwin", session.user.id] });
        }
        setResult(completeResponse);
        setStatus("completed");
        return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
      setSelectedAnswer("");
      setStatus("ready");
    } catch (error: unknown) {
      console.error("Failed to submit interview answer:", error);
      setErrorMessage((error as Error).message || "Failed to submit your answer.");
      setStatus("ready");
    }
  }

  if (isSessionLoading) {
    return (
      <main className="flex   min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your mock interview...
        </div>
      </main>
    );
  }

  if (!session?.user?.id) {
    return (
      <main className="flex   min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-xl border border-border bg-card/80 p-8 text-center dashboard-card">
          <h1 className="text-xl font-semibold">Sign in required</h1>
          <button type="button" onClick={() => router.push("/signin")} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90">Go to Sign In</button>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex   min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-xl border border-border bg-card/80 p-8 text-center dashboard-card">
          <h1 className="text-xl font-semibold">Interview unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
          <button type="button" onClick={() => { setStatus("idle"); setErrorMessage(""); }} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90">Try Again</button>
        </section>
      </main>
    );
  }

  if (status === "completed" && result) {
    return (
      <main className="relative flex   min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-xl border border-border bg-card/80 p-8 text-center dashboard-card sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Interview Complete!</h1>
          <p className="mt-4 text-sm text-muted-foreground">We evaluated your answers across technical depth, problem solving, and communication.</p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col items-center rounded-3xl border border-primary/20 bg-primary/[0.05] p-8">
            <span className="text-sm text-muted-foreground">Overall Interview Score</span>
            <span className="mt-2 text-6xl font-bold text-primary">{result.finalScore}%</span>
          </div>
          <button type="button" onClick={() => router.push("/dashboard/learner")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
            Return to Dashboard
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      </main>
    );
  }

  if (status === "idle") {
    return (
      <main className="relative flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto space-y-8">
        <section className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-card/80 p-8 text-center dashboard-card sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-primary">Mock Interview</p>
          <h1 className="mt-3 text-3xl font-bold">Test your readiness.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Our AI will ask you open-ended questions based on your target role. Use your microphone or text to answer.
          </p>
          <button type="button" onClick={() => void handleStartInterview()} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90">
            Start Mock Interview
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>

        {/* PAST INTERVIEWS HISTORY */}
        {historyData && historyData.length > 0 && (
          <section className="w-full max-w-3xl rounded-xl dashboard-card">
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-border">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Past Interview History</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
                {historyData.length} Completed
              </span>
            </div>
            <div className="space-y-3">
              {historyData.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/80 bg-card-soft hover:border-primary/40 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{s.targetRole || "Technical Role"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "Recent"}
                      </span>
                      <span>•</span>
                      <span>{s.questionsCount || s.questions.length} questions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      (s.score || 0) >= 70
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {s.score ?? 0}% Score
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedHistorySession(s)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      View Transcript
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRANSCRIPT REVIEW MODAL */}
        {selectedHistorySession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> Interview Transcript & Evaluation
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedHistorySession.targetRole || "Mock Interview"} • Final Score: {selectedHistorySession.score}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHistorySession(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-6 py-4 pr-1">
                {selectedHistorySession.questions.map((q, idx) => {
                  const ans = selectedHistorySession.answers.find(a => a.questionId === q.id);
                  const evalData = ans?.evaluation;
                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-border/80 bg-card-soft space-y-3">
                      <p className="font-semibold text-sm text-foreground">
                        Q{idx + 1}: {q.question}
                      </p>
                      <div className="p-3 rounded-lg bg-background border border-border/60">
                        <span className="text-xs font-semibold text-muted-foreground block mb-1">Your Answer:</span>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {ans?.answerText || "No answer recorded."}
                        </p>
                      </div>
                      {evalData && (
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-semibold text-primary block">Evaluation Rubric:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {evalData.technicalKnowledge !== undefined && (
                              <div className="p-2 rounded bg-background border border-border/60 text-xs">
                                <span className="text-muted-foreground block">Tech Knowledge</span>
                                <span className="font-bold text-foreground">{evalData.technicalKnowledge}%</span>
                              </div>
                            )}
                            {evalData.problemSolving !== undefined && (
                              <div className="p-2 rounded bg-background border border-border/60 text-xs">
                                <span className="text-muted-foreground block">Problem Solving</span>
                                <span className="font-bold text-foreground">{evalData.problemSolving}%</span>
                              </div>
                            )}
                            {evalData.clarity !== undefined && (
                              <div className="p-2 rounded bg-background border border-border/60 text-xs">
                                <span className="text-muted-foreground block">Clarity</span>
                                <span className="font-bold text-foreground">{evalData.clarity}%</span>
                              </div>
                            )}
                            {evalData.communication !== undefined && (
                              <div className="p-2 rounded bg-background border border-border/60 text-xs">
                                <span className="text-muted-foreground block">Communication</span>
                                <span className="font-bold text-foreground">{evalData.communication}%</span>
                              </div>
                            )}
                            {evalData.practicalUnderstanding !== undefined && (
                              <div className="p-2 rounded bg-background border border-border/60 text-xs">
                                <span className="text-muted-foreground block">Practical</span>
                                <span className="font-bold text-foreground">{evalData.practicalUnderstanding}%</span>
                              </div>
                            )}
                          </div>
                          {evalData.feedback && (
                            <p className="text-xs text-muted-foreground mt-2 italic bg-muted/30 p-2.5 rounded-lg border border-border/40">
                              Feedback: {evalData.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedHistorySession(null)}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
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

  

  if (status === "loading" || !currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Animated Icon Badge */}
        <div className="relative flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <div className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping" />
          
          {/* Inner badge with bounce effect */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20 transition-all duration-500 ease-out">
            <ActiveIcon className="h-8 w-8 animate-bounce transition-transform duration-300" />
          </div>
        </div>

        {/* Dynamic Playful Text */}
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground transition-opacity duration-300 animate-pulse">
            {PLAYFUL_MESSAGES[index].text}
          </p>
          <p className="text-xs text-muted-foreground">
            Just a few seconds left
          </p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full bg-gradient-to-r from-primary via-purple-500 to-primary animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
        </div>
      </div>
    </main>
    );
  }

  return (
    <main className="relative   min-h-screen w-full max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <p className="mt-2 text-sm text-muted-foreground">Answer carefully. Your responses will be evaluated on multiple dimensions.</p>
      </header>

      <div className="mb-6 rounded-xl border border-border proof-card p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="mt-3 h-2   rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card/80 p-6 dashboard-card sm:p-8">
        <h2 className="text-xl font-semibold leading-8 sm:text-2xl">{currentQuestion.question}</h2>
        
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-card-soft rounded-t-2xl border border-b-0 border-border p-4">
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
            className="min-h-[200px] w-full resize-y rounded-b-2xl rounded-t-none border border-border bg-background p-4 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-xl border border-destructive/20 dashboard-card px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={!selectedAnswer || status === "submitting"}
            onClick={() => void handleNext()}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "submitting" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : isLastQuestion ? (
              <>Finish Interview <CheckCircle2 className="h-4 w-4" /></>
            ) : (
              <>Next Question <ChevronRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </section>
    </main>
  );
}