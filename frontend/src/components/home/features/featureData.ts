import { FiUserCheck, FiGitMerge, FiSliders, FiCheckSquare } from "react-icons/fi";
import { FeatureItem } from "./types";

export const featureItems: FeatureItem[] = [
  {
    id: "04",
    metric: "74/100",
    title: "Career Readiness Twin",
    description: "AI-generated readiness scoring across 7 canonical career domains.",
    icon: FiUserCheck,
    badge: "04 — Twin",
    points: [
      "Overall readiness score per target role (e.g., AI Engineer: 74/100).",
      "7 sub-scores across Knowledge, Practical, Projects, Problem Solving, Communication, Interview, and Evidence.",
      "Structured mastery pipeline: KNOW → GAIN → CAN EXPLAIN → CAN BUILD → CAN IMPACT.",
    ],
  },
  {
    id: "05",
    metric: "100%",
    title: "Proof Graph & Skill Passport",
    description: "Visual proof tree that verifies each skill with real evidence links.",
    icon: FiGitMerge,
    badge: "05 — Proof",
    points: [
      "Skill breakdown tree connecting skills to diagnostics, assessments, and project evidence nodes.",
      "Direct verification sources including GitHub commits, live deployment links, and AI review trails.",
      "Shareable Skill Passport with an overall verified proof score for employers.",
    ],
  },
  {
    id: "06",
    metric: "Zero",
    title: "Adaptive Recovery",
    description: "Guilt-free catch-up plans that get you back on track after a busy week.",
    icon: FiSliders,
    badge: "06 — Engine",
    points: [
      "If you fall behind, your roadmap adapts instead of breaking your streak.",
      "Micro catch-up plans (e.g., a 4-day plan) to resume without frustration.",
      "Your personalized path stays aligned with your target role no matter the pace.",
    ],
  },
  {
    id: "07",
    metric: "Ready",
    title: "Job Reality & Apply Gate",
    description: "Check your skill gap against real market demand with apply-ready gates.",
    icon: FiCheckSquare,
    badge: "07 — Gate",
    points: [
      "Live market analysis comparing your skill scores with what employers actually ask for.",
      "Clear per-skill status: Ready, Moderate, High gap, or Critical gap.",
      "Actionable gate decision: READY TO APPLY vs. areas to fix first before applying.",
    ],
  },
];