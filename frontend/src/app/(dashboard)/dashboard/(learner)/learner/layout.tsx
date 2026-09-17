import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Learner Dashboard",
    template: "%s | Learner | AI Pather",
  },
  description: "Your personalized AI career learning dashboard, progress tracker, and skill diagnostics.",
  robots: { index: false, follow: false },
};

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
