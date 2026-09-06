import {
  AlertTriangle,
  BrainCircuit,
  Clock3,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  CareerDecisionStatus,
  EvidenceFreshness,
  EvidenceQuality,
} from "@/src/lib/api/learner/career-intelligence";

import type { Tone } from "./tones";

export function getDecisionMeta(status: CareerDecisionStatus) {
  switch (status) {
    case "APPLY_NOW":
      return {
        label: "Ready to Apply",
        phase: "Career Ready",
        icon: Rocket,
        tone: "green" as Tone,
      };

    case "PREPARE_THEN_APPLY":
      return {
        label: "Prepare Then Apply",
        phase: "Preparation Phase",
        icon: Sparkles,
        tone: "blue" as Tone,
      };

    case "BUILD_MORE_EVIDENCE":
      return {
        label: "Build More Evidence",
        phase: "Evidence Phase",
        icon: ShieldCheck,
        tone: "amber" as Tone,
      };

    default:
      return {
        label: "Build Core Skills",
        phase: "Foundation Phase",
        icon: BrainCircuit,
        tone: "purple" as Tone,
      };
  }
}

export function getQualityMeta(quality: EvidenceQuality) {
  switch (quality) {
    case "STRONG":
      return {
        label: "Strong",
        tone: "green" as Tone,
      };

    case "MODERATE":
      return {
        label: "Moderate",
        tone: "blue" as Tone,
      };

    case "WEAK":
      return {
        label: "Weak",
        tone: "amber" as Tone,
      };

    default:
      return {
        label: "Unverified",
        tone: "neutral" as Tone,
      };
  }
}

export function getFreshnessMeta(freshness: EvidenceFreshness) {
  switch (freshness) {
    case "FRESH":
      return {
        label: "Fresh",
        tone: "green" as Tone,
        icon: Clock3,
      };

    case "STALE":
      return {
        label: "Stale",
        tone: "amber" as Tone,
        icon: AlertTriangle,
      };

    default:
      return {
        label: "Moderate",
        tone: "neutral" as Tone,
        icon: Clock3,
      };
  }
}