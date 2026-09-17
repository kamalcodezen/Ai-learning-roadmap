import type { Metadata } from "next";
import ProgressPage from "@/src/components/dashboard/learner/progress/ProgressPage";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description: "Track your study hours, milestone completion rates, and learning pace analytics.",
};

export default function Page() {
  return <ProgressPage />;
}
