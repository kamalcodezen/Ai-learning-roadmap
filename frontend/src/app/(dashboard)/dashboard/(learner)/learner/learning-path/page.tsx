import type { Metadata } from "next";
import LearningPathPage from "@/src/components/dashboard/learner/learning-path/LearningPathPage";

export const metadata: Metadata = {
  title: "Learning Path",
  description: "Personalized step-by-step curriculum milestones customized for your target career role.",
};

export default function Page() {
  return <LearningPathPage />;
}
