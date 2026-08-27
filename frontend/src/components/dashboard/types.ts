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
    pendingCount: number;
    completedCount: number;
  };
  proof: {
    trackedSkillsCount: number;
  };
  careerAlignment: {
    target: string;
    isAvailable: boolean;
  };
  applicationReadiness: {
    isAvailable: boolean;
  };
  portfolio: {
    projectCount: number;
  };
}
