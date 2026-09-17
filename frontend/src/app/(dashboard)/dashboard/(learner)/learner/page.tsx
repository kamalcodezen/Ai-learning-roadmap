import type { Metadata } from "next";
import DashboardPage from "@/src/components/dashboard/learner/dashboard/DashboardPage";

export const metadata: Metadata = {
  title: "Learner Dashboard",
  description: "AI-powered overview of your learning streak, skill readiness, and recommended next steps.",
};

export default function Page() {
  return <DashboardPage />;
}
