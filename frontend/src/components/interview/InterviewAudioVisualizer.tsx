"use client";

import React from "react";
import { Mic, Volume2, Sparkles, Brain } from "lucide-react";

interface InterviewAudioVisualizerProps {
  isAiSpeaking: boolean;
  isCandidateSpeaking: boolean;
  statusText?: string;
}

export function InterviewAudioVisualizer({
  isAiSpeaking,
  isCandidateSpeaking,
  statusText,
}: InterviewAudioVisualizerProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Outer Multi-layered Animated Pulse Rings */}
      <div className="relative flex items-center justify-center">
        {/* Ring 1 - Deep ambient background glow */}
        <div
          className={`absolute w-56 h-56 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            isAiSpeaking
              ? "bg-primary/30 scale-125 animate-pulse"
              : isCandidateSpeaking
              ? "bg-emerald-500/30 scale-125 animate-pulse"
              : "bg-primary/10 scale-100"
          }`}
        />

        {/* Ring 2 - Concentric ripple 1 */}
        <div
          className={`absolute w-44 h-44 rounded-full border transition-all duration-500 pointer-events-none ${
            isAiSpeaking
              ? "border-primary/40 scale-110 animate-ping opacity-30"
              : isCandidateSpeaking
              ? "border-emerald-500/40 scale-110 animate-ping opacity-30"
              : "border-border/40 scale-100"
          }`}
        />

        {/* Ring 3 - Concentric ripple 2 */}
        <div
          className={`absolute w-36 h-36 rounded-full border transition-all duration-300 pointer-events-none ${
            isAiSpeaking
              ? "border-primary/50 scale-105"
              : isCandidateSpeaking
              ? "border-emerald-400/50 scale-105"
              : "border-border/60 scale-100"
          }`}
        />

        {/* Central Core Orb */}
        <div
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
            isAiSpeaking
              ? "bg-primary shadow-[0_0_50px_rgba(159,84,247,0.5)] scale-105"
              : isCandidateSpeaking
              ? "bg-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-105"
              : "bg-card border border-border shadow-lg scale-100"
          }`}
        >
          {isAiSpeaking ? (
            <div className="flex flex-col items-center space-y-1">
              <Volume2 className="w-8 h-8 text-white animate-bounce" />
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" />
                <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-150" />
                <span className="w-1 h-6 bg-white rounded-full animate-pulse delay-100" />
                <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-200" />
              </div>
            </div>
          ) : isCandidateSpeaking ? (
            <div className="flex flex-col items-center space-y-1">
              <Mic className="w-8 h-8 text-white animate-pulse" />
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-100" />
                <span className="w-1 h-6 bg-white rounded-full animate-pulse delay-200" />
                <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-75" />
                <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-150" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1">
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                AI Ready
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-xs shadow-md">
        {isAiSpeaking ? (
          <span className="text-primary font-bold flex items-center gap-1.5 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" /> AI Interviewer is asking question...
          </span>
        ) : isCandidateSpeaking ? (
          <span className="text-emerald-500 font-bold flex items-center gap-1.5 animate-pulse">
            <Mic className="w-3.5 h-3.5" /> Listening to your answer in real-time...
          </span>
        ) : (
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {statusText || "Press microphone to speak or type your answer"}
          </span>
        )}
      </div>
    </div>
  );
}
