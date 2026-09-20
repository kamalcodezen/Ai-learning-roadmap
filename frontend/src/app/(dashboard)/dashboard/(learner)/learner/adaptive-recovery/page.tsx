import type { Metadata } from "next";
import { AdaptiveRecoveryPage } from "@/src/components/dashboard/learner/adaptive-recovery";

export const metadata: Metadata = {
  title: "Adaptive Pace & Recovery Engine",
  description: "Personalize your weekly study commitment, track autonomous problem-solving signals, and safely rebuild momentum with zero guilt.",
};

export default function Page() {
  return <AdaptiveRecoveryPage />;
}
