export interface DashboardData {
  user: {
    name: string;
    image: string | null;
  };
  career: {
    targetRole: string;
    experienceLevel: string;
    weeklyAvailableHours?: number;
    status?: string;
  };
  kpis?: {
    targetRole: string;
    careerReadiness: number;
    skillProgress: number;
    learningProgress: number;
    proofStrength: number;
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
    blockingPrerequisite?: string | null;
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
    overallProofScore?: number;
    overallSkillScore?: number;
    employerConfidenceSignal?: number;
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
