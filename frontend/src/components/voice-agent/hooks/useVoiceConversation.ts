"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { sendChatMessage, type ChatMessage } from "@/src/lib/api/chat-ai-mentor/chat";
import type { VoiceAgentStatus, VoiceTurn, VoiceConversationConfig } from "../types";

interface UseVoiceConversationProps {
  initialHistory?: ChatMessage[];
  config?: VoiceConversationConfig;
  onNewTurn?: (turn: VoiceTurn) => void;
}

export function useVoiceConversation({
  initialHistory = [],
  config = {},
  onNewTurn,
}: UseVoiceConversationProps = {}) {
  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [currentAiReply, setCurrentAiReply] = useState<string>("");
  const [micMuted, setMicMuted] = useState(false);

  // Keep an internal array of ChatMessages for the LLM history context
  const chatHistoryRef = useRef<ChatMessage[]>(initialHistory);

  // Sync initial history
  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      chatHistoryRef.current = initialHistory;
    }
  }, [initialHistory]);

  const speechSynth = useSpeechSynthesis({
    preferredGender: config.preferredGender || "female",
    onStart: () => {
      setStatus("speaking");
    },
    onEnd: () => {
      setStatus("listening");
    },
  });

  // Handle user speech submission (triggered when user stops speaking for ~1.4s)
  const handleUserSpeechEnd = useCallback(
    async (spokenText: string) => {
      const cleanInput = spokenText.trim();
      if (!cleanInput) return;

      // Stop any existing speech synthesis
      speechSynth.cancel();

      // Record user turn
      const userTurn: VoiceTurn = {
        id: `user-${Date.now()}`,
        role: "user",
        text: cleanInput,
        timestamp: new Date(),
      };

      setTurns((prev) => [...prev, userTurn]);
      onNewTurn?.(userTurn);

      // Update LLM history ref
      chatHistoryRef.current = [
        ...chatHistoryRef.current,
        { role: "user", content: cleanInput },
      ];

      setStatus("thinking");
      setCurrentAiReply("");

      try {
        const response = await sendChatMessage({
          message: cleanInput,
          history: chatHistoryRef.current,
        });

        const replyText = response.data?.reply || "I am ready to help you.";
        setCurrentAiReply(replyText);

        const assistantTurn: VoiceTurn = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: replyText,
          timestamp: new Date(),
        };

        setTurns((prev) => [...prev, assistantTurn]);
        onNewTurn?.(assistantTurn);

        chatHistoryRef.current = [
          ...chatHistoryRef.current,
          { role: "assistant", content: replyText },
        ];

        // Speak AI reply in natural neural voice
        if (config.autoSpeak !== false) {
          speechSynth.speak(replyText);
        } else {
          setStatus("listening");
        }
      } catch (err: unknown) {
        console.error("[Voice AI Error]:", err);
        const fallbackMessage = "I had trouble connecting. Could you please say that again?";
        setCurrentAiReply(fallbackMessage);

        const errorTurn: VoiceTurn = {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: fallbackMessage,
          timestamp: new Date(),
        };
        setTurns((prev) => [...prev, errorTurn]);
        speechSynth.speak(fallbackMessage);
      }
    },
    [config.autoSpeak, onNewTurn, speechSynth]
  );

  // Barge-in (Live Interruption): When user starts speaking while AI is speaking, interrupt AI!
  const handleUserSpeechStart = useCallback(() => {
    if (status === "speaking") {
      speechSynth.cancel();
      setStatus("listening");
    }
  }, [speechSynth, status]);

  const speechRec = useSpeechRecognition({
    silenceThresholdMs: config.silenceThresholdMs || 1400,
    onSpeechEnd: handleUserSpeechEnd,
    onSpeechStart: handleUserSpeechStart,
  });

  // Start continuous conversational session
  const startSession = useCallback(() => {
    speechSynth.cancel();
    speechRec.startListening();
    setStatus("listening");
  }, [speechRec, speechSynth]);

  // End voice session
  const stopSession = useCallback(() => {
    speechRec.stopListening();
    speechSynth.cancel();
    setStatus("idle");
  }, [speechRec, speechSynth]);

  // Toggle user microphone
  const toggleMic = useCallback(() => {
    setMicMuted((prev) => {
      const next = !prev;
      if (next) {
        speechRec.stopListening();
      } else {
        speechRec.startListening();
        setStatus("listening");
      }
      return next;
    });
  }, [speechRec]);

  return {
    status,
    turns,
    currentAiReply,
    interimTranscript: speechRec.interimTranscript,
    fullUserTranscript: speechRec.fullTranscript,
    isListening: speechRec.isListening,
    isSpeaking: speechSynth.isSpeaking,
    isMicMuted: micMuted,
    isSpeakerMuted: speechSynth.isMuted,
    voices: speechSynth.voices,
    selectedVoice: speechSynth.selectedVoice,
    setSelectedVoice: speechSynth.setSelectedVoice,
    toggleMic,
    toggleSpeaker: speechSynth.toggleMute,
    startSession,
    stopSession,
    isSupported: speechRec.isSupported,
    error: speechRec.error,
  };
}
