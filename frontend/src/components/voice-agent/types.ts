export type VoiceAgentStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type VoiceGender = "female" | "male";

export interface VoiceOption {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  gender: VoiceGender;
  isNatural: boolean;
  voice: SpeechSynthesisVoice | null;
}

export interface VoiceTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface VoiceConversationConfig {
  silenceThresholdMs?: number; // silence duration to auto-submit turn (default: 1400ms)
  preferredGender?: VoiceGender;
  autoSpeak?: boolean;
}
