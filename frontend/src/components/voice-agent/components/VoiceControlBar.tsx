"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import type { VoiceOption } from "../types";

interface VoiceControlBarProps {
  isMicMuted: boolean;
  isSpeakerMuted: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onEndSession: () => void;
  voices: VoiceOption[];
  selectedVoice: VoiceOption | null;
  onSelectVoice: (voice: VoiceOption) => void;
}

export function VoiceControlBar({
  isMicMuted,
  isSpeakerMuted,
  onToggleMic,
  onToggleSpeaker,
  onEndSession,
  voices,
  selectedVoice,
  onSelectVoice,
}: VoiceControlBarProps) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      {/* Voice Selection Dropdown Drawer */}
      {showVoicePicker && voices.length > 0 && (
        <div className="absolute bottom-20 z-50 w-72 max-h-60 overflow-y-auto rounded-2xl bg-card/95 border border-border/80 backdrop-blur-xl p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Select Neural Voice
          </div>
          {voices.slice(0, 10).map((v) => {
            const isSelected = selectedVoice?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  onSelectVoice(v);
                  setShowVoicePicker(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all text-left ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span className="truncate">{v.displayName}</span>
                {v.isNatural && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ml-2 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    Neural
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Glassmorphic Pill Controls */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/90 border border-border/80 backdrop-blur-2xl shadow-2xl">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          className={`relative p-3.5 rounded-full transition-all duration-300 cursor-pointer ${
            isMicMuted
              ? "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
              : "bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/40"
          }`}
        >
          {isMicMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5 text-primary" />
          )}
        </button>

        {/* Voice Persona Selector Toggle */}
        {voices.length > 0 && (
          <button
            onClick={() => setShowVoicePicker((prev) => !prev)}
            title="Choose AI Voice"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-medium cursor-pointer transition-all hover:border-primary/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="max-w-[90px] truncate">
              {selectedVoice?.displayName.split(" ")[0] || "Voice"}
            </span>
            <ChevronUp
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                showVoicePicker ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        {/* Speaker Mute Toggle */}
        <button
          onClick={onToggleSpeaker}
          title={isSpeakerMuted ? "Unmute AI Speaker" : "Mute AI Speaker"}
          className={`p-3.5 rounded-full transition-all duration-300 cursor-pointer ${
            isSpeakerMuted
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
              : "bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/40"
          }`}
        >
          {isSpeakerMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* End Voice Session */}
        <button
          onClick={onEndSession}
          title="Exit Voice Mode"
          className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
