import type { Metadata } from "next";
import SkillGapsPage from "@/src/components/dashboard/learner/skill-gaps/SkillGapsPage";

export const metadata: Metadata = {
  title: "Skill Gaps & Diagnostics",
  description: "AI-driven diagnostics of your missing competencies and actionable bridge recommendations.",
};

export default function Page() {
  return <SkillGapsPage />;
}
