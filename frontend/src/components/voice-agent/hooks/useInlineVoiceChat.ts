"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

interface UseInlineVoiceChatProps {
  onAutoSubmit?: (spokenText: string) => void;
  onTranscriptUpdate?: (interim: string) => void;
}

export function useInlineVoiceChat({
  onAutoSubmit,
  onTranscriptUpdate,
}: UseInlineVoiceChatProps = {}) {
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const speechSynth = useSpeechSynthesis({
    preferredGender: "female",
  });

  const handleSpeechEnd = useCallback(
    (finalText: string) => {
      const clean = finalText.trim();
      if (clean && onAutoSubmit) {
        onAutoSubmit(clean);
      }
    },
    [onAutoSubmit]
  );

  const handleSpeechStart = useCallback(() => {
    // If AI is currently speaking and user speaks, stop AI immediately
    speechSynth.cancel();
  }, [speechSynth]);

  const speechRec = useSpeechRecognition({
    silenceThresholdMs: 1500, // pause duration to auto-submit
    onSpeechEnd: handleSpeechEnd,
    onSpeechStart: handleSpeechStart,
  });

  // Notify parent on live transcript
  const prevInterimRef = useRef("");
  useEffect(() => {
    if (speechRec.fullTranscript !== prevInterimRef.current) {
      prevInterimRef.current = speechRec.fullTranscript;
      onTranscriptUpdate?.(speechRec.fullTranscript);
    }
  }, [speechRec.fullTranscript, onTranscriptUpdate]);

  // Toggle user speech recording
  const toggleMic = useCallback(() => {
    if (speechRec.isListening) {
      speechRec.stopListening();
    } else {
      speechSynth.cancel();
      speechRec.resetTranscript();
      speechRec.startListening();
    }
  }, [speechRec, speechSynth]);

  // Stop everything
  const stopAll = useCallback(() => {
    speechRec.stopListening();
    speechSynth.cancel();
  }, [speechRec, speechSynth]);

  // Speak AI answer out loud if enabled
  const speakReply = useCallback(
    (replyText: string) => {
      if (!voiceReplyEnabled) return;
      speechSynth.speak(replyText);
    },
    [speechSynth, voiceReplyEnabled]
  );

  // Toggle voice output on/off
  const toggleVoiceReply = useCallback(() => {
    setVoiceReplyEnabled((prev) => {
      const next = !prev;
      if (!next) {
        speechSynth.cancel();
      }
      return next;
    });
  }, [speechSynth]);

  return {
    isListening: speechRec.isListening,
    isSpeaking: speechSynth.isSpeaking,
    isSupported: speechRec.isSupported,
    error: speechRec.error,
    voiceReplyEnabled,
    toggleMic,
    stopAll,
    speakReply,
    stopSpeaking: speechSynth.cancel,
    toggleVoiceReply,
  };
}
