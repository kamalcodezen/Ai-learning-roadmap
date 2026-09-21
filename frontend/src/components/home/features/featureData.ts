import {
  FiMap,
  FiTarget,
  FiCode,
  FiGithub,
  FiMic,
  FiCpu,
  FiBriefcase,
  FiMonitor,
} from "react-icons/fi";

import { FeatureItem } from "./types";

export const featureItems: FeatureItem[] = [
  {
    id: "01",
    metric: "Dynamic",
    title: "AI Learning Path",
    description:
      "A personalized roadmap that turns your career goal into clear milestones, resources, and projects.",
    icon: FiMap,
    badge: "01 — Path",
    points: [
      "AI-generated learning paths built around your target career and current skill level.",
      "Interactive milestones connecting concepts, learning resources, and practical projects.",
      "Custom project briefs generated directly from your learning path.",
    ],
  },

  {
    id: "02",
    metric: "AI-Powered",
    title: "Skill Gap Diagnosis",
    description:
      "Discover what you already know, what you're missing, and what needs attention next.",
    icon: FiTarget,
    badge: "02 — Diagnose",
    points: [
      "Baseline diagnostic assessment based on your target career and experience level.",
      "Automatically identifies concept weaknesses and skill gaps across your learning path.",
      "Provides targeted recommendations to help close the gaps.",
    ],
  },

  {
    id: "03",
    metric: "4-Stage",
    title: "Technical Simulation",
    description:
      "Go beyond passive learning with structured AI evaluations that test real technical ability.",
    icon: FiCode,
    badge: "03 — Assess",
    points: [
      "Evaluate Concept Understanding, Code Debugging, Problem Solving, and Explanation.",
      "Track assessment attempts, score history, and performance breakdowns.",
      "Use evaluation results to identify areas that need further development.",
    ],
  },

  {
    id: "04",
    metric: "GitHub",
    title: "AI Code Audit",
    description:
      "Turn your real projects into evidence by having AI analyze the code you've actually built.",
    icon: FiGithub,
    badge: "04 — Prove",
    points: [
      "Analyze repository structure, source files, architecture, and development practices.",
      "Identify code quality issues, missing skills, documentation gaps, and improvement areas.",
      "Connect project audit results to your growing skill evidence.",
    ],
  },

  {
    id: "05",
    metric: "Real-Time",
    title: "Voice Mock Interview",
    description:
      "Practice technical interviews with an AI interviewer and receive a detailed performance scorecard.",
    icon: FiMic,
    badge: "05 — Interview",
    points: [
      "Take role-based technical interviews through real-time voice interaction.",
      "Answer scenario-based questions and respond to AI-generated follow-ups.",
      "Receive feedback on technical proficiency, communication, and identified skill gaps.",
    ],
  },

  {
  id: "09",
  metric: "Admin Console",
  title: "With 18 Modules",
  description:
    "A centralized control suite for monitoring users, AI usage, platform health, and system activity.",
  icon: FiMonitor,
  badge: "09 — Admin",
  points: [
    "Manage users, roles, subscriptions, roadmaps, assessments, projects, and skill evidence.",
    "Monitor AI usage, token costs, system activity, errors, and platform health.",
    "Track platform-wide career readiness, job reality trends, and learning performance.",
  ],
},

  {
    id: "07",
    metric: "AI Engine",
    title: "Career Intelligence",
    description:
      "Bring your skill evidence, portfolio strength, and career alignment into one readiness picture.",
    icon: FiCpu,
    badge: "07 — Intelligence",
    points: [
      "Combine career alignment, portfolio evidence, and application readiness signals.",
      "Compare your verified competencies against the requirements of your target career.",
      "Turn scattered career signals into one unified readiness view.",
    ],
  },

  {
    id: "08",
    metric: "Market Data",
    title: "Job Reality & Apply Gate",
    description:
      "Compare your skills with real market demand and understand what to fix before you apply.",
    icon: FiBriefcase,
    badge: "08 — Career",
    points: [
      "Analyze hiring trends, salary ranges, location-based demand, and skill requirements.",
      "See per-skill status across Ready, Moderate, High Gap, and Critical Gap areas.",
      "Use application readiness checks to identify what needs attention before applying.",
    ],
  },
];