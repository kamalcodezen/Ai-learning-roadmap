"use client";

import React, { useEffect } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { VoiceVisualizerOrb } from "./VoiceVisualizerOrb";
import { VoiceControlBar } from "./VoiceControlBar";
import { useVoiceConversation } from "../hooks/useVoiceConversation";
import type { VoiceTurn } from "../types";
import type { ChatMessage } from "@/src/lib/api/chat-ai-mentor/chat";

interface VoiceLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHistory?: ChatMessage[];
  onNewTurn?: (turn: VoiceTurn) => void;
}

export function VoiceLiveModal({
  isOpen,
  onClose,
  initialHistory = [],
  onNewTurn,
}: VoiceLiveModalProps) {
  const {
    status,
    currentAiReply,
    fullUserTranscript,
    isMicMuted,
    isSpeakerMuted,
    voices,
    selectedVoice,
    setSelectedVoice,
    toggleMic,
    toggleSpeaker,
    startSession,
    stopSession,
    isSupported,
    error,
  } = useVoiceConversation({
    initialHistory,
    onNewTurn,
  });

  // Automatically start voice recognition when opened, stop when closed
  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen, startSession, stopSession]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 md:p-10 bg-background/95 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between">
        {/* Status Pill */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              status === "speaking"
                ? "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse"
                : status === "thinking"
                  ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-ping"
                  : status === "listening"
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    : "bg-muted-foreground"
            }`}
          />
          <span className="text-xs font-semibold tracking-wide text-foreground capitalize">
            {status === "speaking"
              ? "AI Speaking..."
              : status === "thinking"
                ? "AI Reasoning..."
                : status === "listening"
                  ? isMicMuted
                    ? "Mic Muted"
                    : "Listening..."
                  : "Voice Mode Ready"}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-all cursor-pointer"
          title="Close Voice Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Interactive Visualizer Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-6 max-w-xl text-center px-4">
        {/* Unsupported Browser Warning */}
        {!isSupported && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Speech recognition works best in Chrome, Edge, Safari, and Brave.
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Glowing Orb */}
        <VoiceVisualizerOrb status={status} isMicMuted={isMicMuted} />

        {/* Real-time Subtitles / Live Transcript Pill */}
        <div className="min-h-[64px] flex items-center justify-center">
          {fullUserTranscript ? (
            <div className="px-5 py-3 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-md shadow-lg max-w-lg text-sm font-medium text-foreground leading-relaxed animate-in fade-in zoom-in-95 duration-200">
              <span className="text-primary font-bold mr-2">You:</span>
              <span>{fullUserTranscript}</span>
            </div>
          ) : currentAiReply && status === "speaking" ? (
            <div className="px-5 py-3 rounded-2xl bg-card/80 border border-primary/20 backdrop-blur-md shadow-lg max-w-lg text-sm text-foreground/90 line-clamp-3 leading-relaxed animate-in fade-in zoom-in-95 duration-200">
              <span className="text-purple-400 font-bold mr-2">AI:</span>
              <span>{currentAiReply}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/80 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
              Speak naturally. You can interrupt AI at any time.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 w-full max-w-md">
        <VoiceControlBar
          isMicMuted={isMicMuted}
          isSpeakerMuted={isSpeakerMuted}
          onToggleMic={toggleMic}
          onToggleSpeaker={toggleSpeaker}
          onEndSession={onClose}
          voices={voices}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>
    </div>
  );
}
