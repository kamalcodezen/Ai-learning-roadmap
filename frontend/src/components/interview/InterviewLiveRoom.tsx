"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Code2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { InterviewAudioVisualizer } from "./InterviewAudioVisualizer";

interface QuestionItem {
  id: string;
  question: string;
  order: number;
  category?: string;
  skillFocus?: string;
}

interface InterviewLiveRoomProps {
  targetRole: string;
  questions: QuestionItem[];
  currentQuestionIndex: number;
  onAnswerSubmit: (answerText: string) => Promise<void>;
  onEndEarly: () => void;
  isSubmitting: boolean;
}

export function InterviewLiveRoom({
  targetRole,
  questions,
  currentQuestionIndex,
  onAnswerSubmit,
  onEndEarly,
  isSubmitting,
}: InterviewLiveRoomProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const [inputMode, setInputMode] = useState<"voice" | "code">("voice");
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Speech Synthesis (AI Speaks Question)
  const speakQuestion = useCallback((text: string) => {
    if (isAiMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel"))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore synthesis initialization errors
    }
  }, [isAiMuted]);

  // Speak question automatically when index changes
  useEffect(() => {
    if (!currentQuestion) return;

    const timeout = setTimeout(() => {
      speakQuestion(currentQuestion.question);
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex, currentQuestion, speakQuestion]);

  // Speech Recognition (Microphone listening)
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
      setErrorMessage("Speech recognition not supported in this browser. Please type your answer.");
      return;
    }

    try {
      interface SpeechRecognitionLike {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
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
      recog.lang = "en-US";

      const initialText = answerText;

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
        setAnswerText(initialText + separator + transcript);
      };

      recog.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access denied. Please allow it in browser settings.");
        }
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recog.start();
      recognitionRef.current = recog;
      setIsRecording(true);
      setErrorMessage("");
    } catch {
      setErrorMessage("Could not activate microphone.");
      setIsRecording(false);
    }
  };

  const handleFinishAndSubmit = async () => {
    if (!answerText.trim() || isSubmitting) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const currentText = answerText;
    setAnswerText("");
    await onAnswerSubmit(currentText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* ── Top HUD Control Bar ── */}
      <div className="dashboard-card !p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="font-bold text-sm text-foreground">{targetRole} Interview</h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Timer: {formatTimer(timerSeconds)}
            </span>
          </div>
        </div>

        {/* Question Progress Counter */}
        <div className="flex flex-col items-center min-w-[140px]">
          <div className="flex justify-between items-center w-full text-xs font-bold mb-1 text-primary">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isAiSpeaking) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
              }
              setIsAiMuted(!isAiMuted);
            }}
            title={isAiMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            className="p-2 rounded-lg bg-card-soft hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
          >
            {isAiMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>

          <button
            type="button"
            onClick={onEndEarly}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors cursor-pointer border border-red-500/20"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* ── Central AI Visualizer Stage ── */}
      <InterviewAudioVisualizer
        isAiSpeaking={isAiSpeaking}
        isCandidateSpeaking={isRecording}
        statusText={
          isRecording
            ? "Speaking... (Your live speech is being transcribed below)"
            : "Click the microphone to speak, or type your answer below"
        }
      />

      {/* ── Current Question Card ── */}
      {currentQuestion && (
        <div className="dashboard-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {currentQuestion.category || "Technical & Problem Solving"}
            </span>

            <button
              type="button"
              onClick={() => speakQuestion(currentQuestion.question)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span>Repeat Question</span>
            </button>
          </div>

          <h2 className="text-base sm:text-xl font-black text-foreground leading-relaxed tracking-tight">
            {currentQuestion.question}
          </h2>
        </div>
      )}

      {/* ── Answer & Live Transcription Area ── */}
      <div className="dashboard-card space-y-4">
        {/* Input Mode Switcher Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode("voice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                inputMode === "voice"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Live Voice Transcription
            </button>
            <button
              type="button"
              onClick={() => setInputMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                inputMode === "code"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Code & Pseudocode Editor
            </button>
          </div>

          {answerText && (
            <button
              type="button"
              onClick={() => setAnswerText("")}
              className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear Text
            </button>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Textarea / Live Speech Output */}
        <div className="relative">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={
              inputMode === "voice"
                ? isRecording
                  ? "Listening to your voice... Speak your response clearly..."
                  : "Click the Microphone button below to speak, or start typing your answer here..."
                : "Type your code, architecture explanation, or pseudocode here..."
            }
            rows={5}
            className={`w-full p-4 rounded-lg bg-card-soft border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all resize-none leading-relaxed ${
              inputMode === "code" ? "font-mono text-xs" : ""
            }`}
          />

          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[11px] font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Recording Active
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md ${
              isRecording
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Speak with Microphone
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFinishAndSubmit}
            disabled={!answerText.trim() || isSubmitting}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-extrabold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer with AI...
              </>
            ) : isLastQuestion ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Submit & Complete Interview
              </>
            ) : (
              <>
                <span>Submit Answer & Next Question</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
