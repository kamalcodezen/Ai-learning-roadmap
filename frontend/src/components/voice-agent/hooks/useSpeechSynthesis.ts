"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VoiceOption, VoiceGender } from "../types";

/**
 * Strips raw Markdown, code blocks, URLs, and formatting so the speech
 * synthesis engine speaks clean, human-like conversational English.
 */
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return "";

  let text = markdown;

  // Remove code blocks (```...```) and replace with friendly speech pause
  text = text.replace(/```[\s\S]*?```/g, " Here is the code snippet. ");

  // Remove inline code (`code`)
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove Markdown image syntax ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "");

  // Convert Markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Remove markdown headers (#, ##, ###)
  text = text.replace(/#{1,6}\s+/g, "");

  // Remove bold / italics (*text*, **text**, _text_, __text__)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove blockquotes (> quote)
  text = text.replace(/^>\s+/gm, "");

  // Remove horizontal rules (--- or ***)
  text = text.replace(/^([-*_]){3,}\s*$/gm, "");

  // Clean bullet list markers (*, -, +) and numbered lists (1.)
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Remove common emojis and symbol clutter
  text = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ""
  );

  // Normalize excessive whitespaces and multiple linebreaks
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

interface UseSpeechSynthesisProps {
  onStart?: () => void;
  onEnd?: () => void;
  preferredGender?: VoiceGender;
}

export function useSpeechSynthesis({
  onStart,
  onEnd,
  preferredGender = "female",
}: UseSpeechSynthesisProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Discover and categorize high quality neural voices
  const populateVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const rawVoices = window.speechSynthesis.getVoices();
    if (!rawVoices || rawVoices.length === 0) return;

    // Filter to English voices
    const enVoices = rawVoices.filter((v) => v.lang.startsWith("en"));

    const voiceOptions: VoiceOption[] = enVoices.map((v) => {
      const nameLower = v.name.toLowerCase();
      const isNatural =
        nameLower.includes("natural") ||
        nameLower.includes("neural") ||
        nameLower.includes("online") ||
        nameLower.includes("enhanced") ||
        nameLower.includes("google") ||
        nameLower.includes("premium");

      // Infer gender
      const isMale =
        nameLower.includes("guy") ||
        nameLower.includes("david") ||
        nameLower.includes("daniel") ||
        nameLower.includes("george") ||
        nameLower.includes("christopher") ||
        nameLower.includes("mark") ||
        nameLower.includes("male");

      const gender: VoiceGender = isMale ? "male" : "female";

      // Clean display name
      let displayName = v.name
        .replace(/microsoft/i, "")
        .replace(/online \(natural\)/i, "(Natural)")
        .replace(/desktop/i, "")
        .replace(/english \(.*?\)/i, "")
        .trim();

      if (!displayName) displayName = v.name;

      return {
        id: v.voiceURI || v.name,
        name: v.name,
        displayName: `${displayName} (${gender === "female" ? "♀" : "♂"})`,
        lang: v.lang,
        gender,
        isNatural,
        voice: v,
      };
    });

    // Sort: natural voices first
    voiceOptions.sort((a, b) => {
      if (a.isNatural && !b.isNatural) return -1;
      if (!a.isNatural && b.isNatural) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    setVoices(voiceOptions);

    // Pick best default matching preferred gender
    const defaultVoice =
      voiceOptions.find((v) => v.gender === preferredGender && v.isNatural) ||
      voiceOptions.find((v) => v.isNatural) ||
      voiceOptions[0] ||
      null;

    setSelectedVoice((prev) => prev || defaultVoice);
  }, [preferredGender]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const timer = setTimeout(() => {
      populateVoices();
    }, 0);

    window.speechSynthesis.onvoiceschanged = populateVoices;
    return () => {
      clearTimeout(timer);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [populateVoices]);

  // Cancel any active speech immediately (Barge-in / Interruption)
  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (rawText: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      if (isMuted) {
        return;
      }

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText.trim()) {
        return;
      }

      // Cancel ongoing utterance before starting new speech
      cancel();

      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05; // natural speaking pace
        utterance.pitch = 1.0;

        if (selectedVoice?.voice) {
          utterance.voice = selectedVoice.voice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          onStart?.();
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          onEnd?.();
          currentUtteranceRef.current = null;
        };

        utterance.onerror = (e) => {
          // 'interrupted' is expected when user interrupts, don't flag as failure
          if (e.error !== "interrupted") {
            console.warn("[SpeechSynthesis error]:", e.error);
          }
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("[SpeechSynthesis speak failed]:", err);
        setIsSpeaking(false);
      }
    },
    [cancel, isMuted, onEnd, onStart, selectedVoice]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        cancel();
      }
      return next;
    });
  }, [cancel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isSpeaking,
    speak,
    cancel,
    voices,
    selectedVoice,
    setSelectedVoice,
    isMuted,
    toggleMute,
  };
}
