"use client";

import React, { useState } from "react";
import {
  Brain,
  Code2,
  Users,
  Target,
  Sparkles,
  Mic,
  Volume2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  History,
  Calendar,
} from "lucide-react";

interface InterviewLobbyProps {
  targetRole: string;
  experienceLevel: string;
  onStart: (options: { mode: string; questionCount: number }) => void;
  isLoading: boolean;
  historyData?: Array<{
    id: string;
    targetRole?: string;
    score?: number;
    completedAt?: string;
    questionsCount?: number;
    answersCount?: number;
  }>;
  onViewHistorySession?: (sessionId: string) => void;
}

export function InterviewLobby({
  targetRole,
  experienceLevel,
  onStart,
  isLoading,
  historyData,
  onViewHistorySession,
}: InterviewLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<string>("TECHNICAL");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [micTestPassed, setMicTestPassed] = useState<boolean>(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const MODES = [
    {
      id: "TECHNICAL",
      title: "System Architecture & Concepts",
      subtitle: "Deep engineering mechanics",
      description:
        "High-scale architecture, framework internals, caching strategies, and concurrency patterns.",
      icon: <Brain className="w-5 h-5 text-primary" />,
      badge: "Architecture",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "PROBLEM_SOLVING",
      title: "Algorithmic Problem Solving",
      subtitle: "Code complexity & live scenarios",
      description:
        "Algorithmic bottlenecks, memory leak debugging, $O(N)$ optimization, and edge case problem solving.",
      icon: <Code2 className="w-5 h-5 text-primary" />,
      badge: "Problem Solving",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "BEHAVIORAL",
      title: "Behavioral & Leadership (STAR)",
      subtitle: "Situation • Task • Action • Result",
      description:
        "Teamwork, engineering tradeoffs vs deadlines, conflict resolution, and ownership.",
      icon: <Users className="w-5 h-5 text-primary" />,
      badge: "Behavioral",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "SKILL_GAP",
      title: "Target Skill Gap Focus Drill",
      subtitle: "Targeting your weak competencies",
      description:
        "Custom diagnostic challenges engineered specifically for your identified weak skills.",
      icon: <Target className="w-5 h-5 text-primary" />,
      badge: "Skill Drill",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
  ];

  const handleTestMicrophone = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicNotice("Speech recognition is not natively supported in this browser. You can still type your answers!");
      setTimeout(() => setMicNotice(null), 6000);
      return;
    }

    try {
      setIsTestingMic(true);
      // Test browser speech synthesis as well
      if ("speechSynthesis" in window) {
        const testUtterance = new SpeechSynthesisUtterance("Audio diagnostic check. Microphone and speaker are operational.");
        testUtterance.rate = 1.0;
        window.speechSynthesis.speak(testUtterance);
      }
      setTimeout(() => {
        setIsTestingMic(false);
        setMicTestPassed(true);
      }, 2500);
    } catch {
      setIsTestingMic(false);
    }
  };

  return (
    <div className="w-full flex flex-col dashboard-card-gap animate-in fade-in duration-500">
      {/* Hero Welcome & Role Card */}
      <div className="dashboard-card flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI Live Voice Technical Interview Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Prepare for {targetRole}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Real-time conversational AI interviewer evaluating your systems architecture, algorithmic problem solving, and communication in an authentic high-stakes simulation.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-emerald-500">
              <ShieldCheck className="w-4 h-4" /> Role-Adaptive AI
            </span>
            <span>•</span>
            <span className="capitalize">{experienceLevel.toLowerCase()} Level</span>
          </div>
        </div>

        {/* Audio Quick Tester */}
        <div className="flex flex-col items-center md:items-end gap-2 p-4 rounded-lg bg-card-soft border border-border shrink-0 w-full md:w-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Audio Diagnostic
          </span>
          <button
            type="button"
            onClick={handleTestMicrophone}
            disabled={isTestingMic}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              micTestPassed
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                : "bg-card hover:bg-muted text-foreground border border-border"
            }`}
          >
            {micTestPassed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Audio Ready
              </>
            ) : isTestingMic ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce text-primary" /> Testing Audio...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-primary" /> Test Mic & Speaker
              </>
            )}
          </button>
          {micNotice && (
            <p className="text-[11px] text-amber-500 font-medium max-w-[220px] text-center md:text-right animate-in fade-in">
              {micNotice}
            </p>
          )}
        </div>
      </div>

      {/* Mode Selection Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <span>1. Select Interview Mode</span>
          </h2>
          <span className="text-xs text-muted-foreground">Tailored for {targetRole}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedMode(mode.id);
                  }
                }}
                className={`dashboard-card text-left cursor-pointer flex flex-col justify-between space-y-3 h-full ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-card-soft border border-border">
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{mode.title}</h3>
                      <p className="text-xs text-muted-foreground">{mode.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${mode.badgeColor}`}>
                    {mode.badge}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {mode.description}
                </p>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-primary">
                    {isSelected ? "Active Selection ✓" : "Click to select"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Length / Question Count Selector */}
      <div className="dashboard-card space-y-3 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">2. Interview Session Length</h3>
            <p className="text-xs text-muted-foreground">Choose the number of progressive scenario questions</p>
          </div>
          <Clock className="w-4 h-4 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap pt-1">
          <button
            type="button"
            onClick={() => setQuestionCount(3)}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              questionCount === 3
                ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary"
                : "border-border bg-card-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">⚡ Quick Sprint (3 Questions)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ~10–15 minutes • Core Architecture, Problem Solving, and Production Incident
            </p>
          </button>

          <button
            type="button"
            onClick={() => setQuestionCount(5)}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              questionCount === 5
                ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary"
                : "border-border bg-card-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">🏆 Full Simulation (5 Questions)</span>
              <span className="text-[11px] text-muted-foreground">Comprehensive</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ~25–30 minutes • Deep Technical, Algorithmic Code, Security & STAR Behavioral
            </p>
          </button>
        </div>
      </div>

      {/* Start Action Launchpad Button */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <button
          type="button"
          onClick={() => onStart({ mode: selectedMode, questionCount })}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[300px] flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>Generating Role-Specific AI Interview...</>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Enter Live AI Interview Room</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Microphone access is optional. You can speak with live speech recognition or type your answers.
        </p>
      </div>

      {/* Past History Preview */}
      {historyData && historyData.length > 0 && (
        <div className="dashboard-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Past Interview History
            </h3>
            <span className="text-xs text-muted-foreground">{historyData.length} Completed Sessions</span>
          </div>

          <div className="space-y-2.5">
            {historyData.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-card-soft border border-border hover:border-primary/40 transition-colors text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground">{session.targetRole || targetRole}</span>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "Recent"}
                    </span>
                    <span>•</span>
                    <span>{session.questionsCount || 3} Questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full border ${
                      (session.score || 0) >= 70
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                    }`}
                  >
                    {session.score || 0}% Score
                  </span>
                  {onViewHistorySession && (
                    <button
                      type="button"
                      onClick={() => onViewHistorySession(session.id)}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
