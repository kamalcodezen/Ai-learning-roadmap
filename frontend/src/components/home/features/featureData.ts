import { FiUserCheck, FiGitMerge, FiSliders, FiCheckSquare } from "react-icons/fi";
import { FeatureItem } from "./types";

export const featureItems: FeatureItem[] = [
  {
    id: "04",
    metric: "74/100",
    title: "Career Readiness Twin",
    description: "Digital skill representation scoring across 7 core caliber domains.",
    icon: FiUserCheck,
    badge: "04 — Twin",
    points: [
      "Overall readiness score (e.g., Frontend Developer: 74/100).",
      "7 Sub-scores across Knowledge, Practical, Projects, Problem Solving, Communication, Interview, and Evidence.",
      "Structured progression workflow: Know → Can Do → Can Explain → Can Build → Can Prove.",
    ],
  },
  {
    id: "05",
    metric: "100%",
    title: "Skill Proof Graph",
    description: "Visual proof tree verifying skill authenticity with evidence links.",
    icon: FiGitMerge,
    badge: "05 — Proof",
    points: [
      "Skill breakdown tree linking nodes (Quiz, Practice, Project Evidence).",
      "Direct verification sources including GitHub Commits, Live Deployment Links, and AI Review Source links.",
    ],
  },
  {
    id: "06",
    metric: "Zero",
    title: "Adaptive Recovery",
    description: "Adjust weekly hours and use guilt-free recovery plans to stay on track.",
    icon: FiSliders,
    badge: "06 — Engine",
    points: [
      "Roadmap Simulator with interactive weekly hour slider (3h → 12h).",
      "Zero-Guilt Recovery mode featuring micro catch-up plans to resume without frustration.",
    ],
  },
  {
    id: "07",
    metric: "Ready",
    title: "JD Reality Check",
    description: "Match job ads against your skill gap with actionable apply readiness gates.",
    icon: FiCheckSquare,
    badge: "07 — Gate",
    points: [
      "Paste job descriptions or links for immediate skill gap & match percentage analysis.",
      "Actionable gate decisions: DON'T APPLY YET (with recommended fixes) vs. READY TO APPLY.",
    ],
  },
];