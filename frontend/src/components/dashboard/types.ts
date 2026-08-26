export interface DashboardData {
  user: {
    name: string;
    image: string | null;
  };
  career: {
    targetRole: string;
    experienceLevel: string;
    status?: string;
  };
  readiness: {
    score: number;
    knowledge: number | null;
    practical: number | null;
    projects: number | null;
    problemSolving: number | null;
    communication: number | null;
    interview: number | null;
    evidence: number | null;
  };
  nextAction: {
    title: string;
    description: string;
    reason: string;
    actionLabel: string;
    href: string;
  } | null;
  roadmap: {
    currentMilestone: string;
    progress: number;
    milestones: {
      name: string;
      status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
    }[];
  } | null;
  learningDebt: {
    skill: string;
    reason: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    source: string;
  }[];
  skills: {
    name: string;
    score: number;
    trend: "UP" | "DOWN" | "FLAT" | "NEW";
  }[];
  weeklyProgress: {
    learning: number | null;
    assessments: number | null;
    projects: number | null;
    practice: number | null;
    careerReadiness: number | null;
  };
  assessments: {
    name: string;
    status: "COMPLETED" | "NOT_STARTED" | "IN_PROGRESS";
    score: number | null;
  }[];
  proof: {
    skillName: string;
    knowledge: "COMPLETED" | "PENDING";
    practice: "COMPLETED" | "PENDING";
    evidence: "COMPLETED" | "PENDING" | "WARNING";
  };
  careerAlignment: {
    target: string;
    fitScore: number;
    strong: string[];
    needsAttention: string[];
  };
  applicationReadiness: {
    technical: number | null;
    projects: number | null;
    portfolio: number | null;
    interview: number | null;
    resume: number | null;
  };
  portfolio: {
    score: number | null;
    projectCount: number;
  };
}
