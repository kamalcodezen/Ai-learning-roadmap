"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    isFinal: boolean;
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance;
}

interface UseSpeechRecognitionProps {
  silenceThresholdMs?: number;
  onSpeechEnd?: (finalText: string) => void;
  onSpeechStart?: () => void;
}

export function useSpeechRecognition({
  silenceThresholdMs = 1400,
  onSpeechEnd,
  onSpeechStart,
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Lazy initialize isSupported without triggering cascading renders in useEffect
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const speechWin = window as unknown as {
      SpeechRecognition?: ISpeechRecognitionConstructor;
      webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    };
    return Boolean(speechWin.SpeechRecognition || speechWin.webkitSpeechRecognition);
  });

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>("");
  const isManuallyStoppedRef = useRef<boolean>(false);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const speechWin = window as unknown as {
      SpeechRecognition?: ISpeechRecognitionConstructor;
      webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    };
    const RecognitionClass =
      speechWin.SpeechRecognition || speechWin.webkitSpeechRecognition;

    if (!RecognitionClass) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Stop existing instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignored
      }
    }

    setError(null);
    setInterimTranscript("");
    accumulatedTranscriptRef.current = "";
    isManuallyStoppedRef.current = false;

    try {
      const recognition = new RecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        onSpeechStart?.();
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let currentInterim = "";
        let newFinal = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            newFinal += result[0].transcript + " ";
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (newFinal) {
          accumulatedTranscriptRef.current = (
            accumulatedTranscriptRef.current +
            " " +
            newFinal
          ).trim();
          setFinalTranscript(accumulatedTranscriptRef.current);
        }

        setInterimTranscript(currentInterim);

        // When words are spoken, clear prior silence timer and set new silence timeout (VAD)
        const combined = (
          accumulatedTranscriptRef.current +
          " " +
          currentInterim
        ).trim();

        if (combined.length > 0) {
          clearSilenceTimer();
          silenceTimerRef.current = setTimeout(() => {
            if (combined.trim().length > 0) {
              onSpeechEnd?.(combined.trim());
              accumulatedTranscriptRef.current = "";
              setInterimTranscript("");
              setFinalTranscript("");
            }
          }, silenceThresholdMs);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        // 'no-speech' is expected during quiet pauses, don't crash
        if (event.error === "no-speech") {
          return;
        }

        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Please allow microphone access.");
          setIsListening(false);
          return;
        }

        if (event.error === "network") {
          setError("Network error in speech recognition.");
        }
      };

      recognition.onend = () => {
        // If not manually stopped by user and still in listening session, auto-restart
        if (!isManuallyStoppedRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // Ignored
          }
        }
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize microphone.";
      setError(msg);
      setIsListening(false);
    }
  }, [clearSilenceTimer, onSpeechEnd, onSpeechStart, silenceThresholdMs]);

  const resetTranscript = useCallback(() => {
    setInterimTranscript("");
    setFinalTranscript("");
    accumulatedTranscriptRef.current = "";
    clearSilenceTimer();
  }, [clearSilenceTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignored
        }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    interimTranscript,
    finalTranscript,
    fullTranscript: (
      finalTranscript +
      (interimTranscript ? " " + interimTranscript : "")
    ).trim(),
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
