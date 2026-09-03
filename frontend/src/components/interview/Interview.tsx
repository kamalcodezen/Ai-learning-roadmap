"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Loader2, Target, Mic, MicOff } from "lucide-react";
import { startInterview, submitInterviewAnswer, completeInterview } from "@/src/lib/actions/learner/interview";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";

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

    const SpeechRecognition = (window as unknown as { SpeechRecognition: new () => unknown, webkitSpeechRecognition: new () => unknown }).SpeechRecognition || (window as unknown as { SpeechRecognition: new () => unknown, webkitSpeechRecognition: new () => unknown }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    try {
      const recog = new SpeechRecognition() as { continuous: boolean; interimResults: boolean; onresult: (event: { resultIndex: number, results: { isFinal?: boolean, [key: number]: { transcript: string }, length: number }[] }) => void; onerror: (event: { error: string }) => void; onend: () => void; start: () => void; stop: () => void; };
      recog.continuous = true;
      recog.interimResults = true;
      let committedText = selectedAnswer;

      recog.onresult = (event: { resultIndex: number, results: { isFinal?: boolean, [key: number]: { transcript: string }, length: number }[] }) => {
        let interimTranscript = '';
        let currentFinal = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        committedText += currentFinal;
        setSelectedAnswer(committedText + interimTranscript);
      };

      recog.onerror = (event: { error: string }) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
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
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your mock interview...
        </div>
      </main>
    );
  }

  if (!session?.user?.id) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-[28px] border border-border bg-card/80 p-8 text-center shadow-[var(--shadow)] backdrop-blur-xl">
          <h1 className="text-xl font-semibold">Sign in required</h1>
          <button type="button" onClick={() => router.push("/signin")} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90">Go to Sign In</button>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-[28px] border border-border bg-card/80 p-8 text-center shadow-[var(--shadow)] backdrop-blur-xl">
          <h1 className="text-xl font-semibold">Interview unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
          <button type="button" onClick={() => { setStatus("idle"); setErrorMessage(""); }} className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-secondary transition hover:opacity-90">Try Again</button>
        </section>
      </main>
    );
  }

  if (status === "completed" && result) {
    return (
      <main className="relative flex min-h-[70vh] items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-[32px] border border-border bg-card/80 p-8 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:p-12">
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
      <main className="relative flex min-h-[70vh] items-center justify-center px-4">
        <section className="relative z-10 w-full max-w-2xl rounded-[32px] border border-border bg-card/80 p-8 text-center shadow-[var(--shadow)] backdrop-blur-xl sm:p-12">
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
      </main>
    );
  }

  if (status === "loading" || !currentQuestion) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating personalized questions...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[70vh] w-full max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <p className="mt-2 text-sm text-muted-foreground">Answer carefully. Your responses will be evaluated on multiple dimensions.</p>
      </header>

      <div className="mb-6 rounded-2xl border border-border bg-card/70 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="rounded-[28px] border border-border bg-card/80 p-6 shadow-[var(--shadow)] sm:p-8">
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
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
