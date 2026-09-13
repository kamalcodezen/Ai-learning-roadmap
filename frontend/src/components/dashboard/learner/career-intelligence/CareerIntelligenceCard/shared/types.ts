import type { ReactNode } from "react";
import type { Tone } from "./tones";

export interface SignalProps {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone?: Tone;
}

export interface ReadinessDimension {
  label: string;
  value: string;
  score: number | null;
  icon: ReactNode;
  highlighted?: boolean;
}