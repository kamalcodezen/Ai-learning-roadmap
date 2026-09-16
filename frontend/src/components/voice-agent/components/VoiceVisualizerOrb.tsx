"use client";

import React from "react";
import type { VoiceAgentStatus } from "../types";

interface VoiceVisualizerOrbProps {
  status: VoiceAgentStatus;
  isMicMuted?: boolean;
}

export function VoiceVisualizerOrb({
  status,
  isMicMuted = false,
}: VoiceVisualizerOrbProps) {
  // Determine state-specific animation classes and colors
  const isListening = status === "listening" && !isMicMuted;
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 select-none">
      {/* Outer ambient glow field */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
          isSpeaking
            ? "bg-gradient-to-tr from-purple-600/40 via-pink-500/30 to-blue-500/40 scale-125 animate-pulse"
            : isThinking
              ? "bg-gradient-to-tr from-amber-500/30 via-purple-600/40 to-cyan-400/30 scale-110 animate-spin"
              : isListening
                ? "bg-gradient-to-tr from-primary/30 via-cyan-500/20 to-purple-500/30 scale-105"
                : "bg-primary/15 scale-90"
        }`}
      />

      {/* Ripple ring 1 */}
      <div
        className={`absolute w-56 h-56 md:w-68 md:h-68 rounded-full border border-primary/20 transition-all duration-700 ${
          isSpeaking
            ? "scale-125 opacity-70 animate-ping"
            : isListening
              ? "scale-110 opacity-50 animate-pulse"
              : "scale-100 opacity-20"
        }`}
      />

      {/* Ripple ring 2 */}
      <div
        className={`absolute w-48 h-48 md:w-56 md:h-56 rounded-full border border-purple-400/30 transition-all duration-500 ${
          isThinking
            ? "animate-spin border-dashed border-cyan-400/50"
            : isSpeaking
              ? "scale-115 opacity-80"
              : "scale-100 opacity-30"
        }`}
      />

      {/* Core Glowing Orb */}
      <div
        className={`relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full shadow-2xl transition-all duration-500 ${
          isSpeaking
            ? "scale-110 shadow-[0_0_80px_rgba(168,85,247,0.8)] bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-500"
            : isThinking
              ? "scale-105 shadow-[0_0_70px_rgba(59,130,246,0.8)] bg-gradient-to-br from-cyan-400 via-purple-600 to-amber-400 animate-pulse"
              : isListening
                ? "scale-100 shadow-[0_0_60px_rgba(159,84,247,0.6)] bg-gradient-to-br from-primary via-purple-700 to-indigo-900"
                : "scale-95 shadow-[0_0_30px_rgba(159,84,247,0.3)] bg-gradient-to-br from-muted/80 via-card to-background border border-border"
        }`}
      >
        {/* Inner animated core mesh */}
        <div className="absolute inset-2 rounded-full overflow-hidden backdrop-blur-sm flex items-center justify-center">
          {/* Animated sound wave bars when speaking */}
          {isSpeaking ? (
            <div className="flex items-center gap-1.5 h-12">
              <span className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_100ms] h-6" />
              <span className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_200ms] h-10" />
              <span className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_300ms] h-12" />
              <span className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_200ms] h-9" />
              <span className="w-1.5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_100ms] h-5" />
            </div>
          ) : isThinking ? (
            /* Thinking spinner */
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isListening ? (
            /* Listening pulse dot */
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-white/40 animate-ping" />
              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-lg" />
            </div>
          ) : (
            /* Idle dot */
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60" />
          )}
        </div>

        {/* Specular glass highlight reflection */}
        <div className="absolute top-2 left-4 w-12 h-6 bg-white/20 rounded-full transform -rotate-45 blur-xs" />
      </div>
    </div>
  );
}
