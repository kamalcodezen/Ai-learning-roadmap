import { serverFetch, serverMutation } from "../../core/server";

export type PaceCategory = "STEADY" | "RECOMMENDED" | "INTENSIVE" | "IMMERSIVE";

export interface PaceProjectionPoint {
  weeklyHours: number;
  weeksRemaining: number;
  monthsRemaining: number;
  completionDate: string; // ISO string
  paceCategory: PaceCategory;
  paceLabel: string;
  intensityDescription: string;
}

export interface RoadmapSimulatorOutput {
  targetRole: string;
  weeklyAvailableHours: number;
  totalMilestones: number;
  completedMilestones: number;
  remainingMilestones: number;
  totalEstimatedHours: number;
  remainingEstimatedHours: number;
  currentPace: PaceProjectionPoint;
  projections: PaceProjectionPoint[];
  milestoneSummary: {
    id?: string;
    title: string;
    status: string;
    estimatedHours: number;
  }[];
}

export interface RecoveryStep {
  dayIndex: number; // 1, 2, 3, 4
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  type: "REFRESHER" | "PUZZLE" | "ROADMAP_STEP" | "MOMENTUM_BOOST";
  completed: boolean;
  completedAt?: string | null;
  content: {
    targetSkillOrConcept: string;
    description: string;
    details?: string[];
    puzzleQuestion?: string;
    puzzleOptions?: string[];
    puzzleCorrectIndex?: number;
    puzzleExplanation?: string;
    actionLabel: string;
    actionHref?: string;
  };
}

export interface ZeroGuiltRecoveryOutput {
  isRecoveryEligible: boolean;
  isRecoveryActive: boolean;
  isDismissed: boolean;
  isCompleted: boolean;
  daysInactive: number;
  lastActiveDate: string | null;
  welcomeMessage: {
    heading: string;
    subheading: string;
    encouragement: string;
  };
  targetMilestoneTitle: string;
  targetSkill: string;
  completedStepsCount: number;
  totalStepsCount: number;
  progressPercent: number;
  steps: RecoveryStep[];
}

export type DependencyCategory = "INDEPENDENT" | "BALANCED" | "HIGH_RELIANCE";

export interface DependencyPillar {
  name: string;
  score: number;
  dependencyScore: number;
  weight: number;
  status: "OPTIMAL" | "HEALTHY" | "NEEDS_ATTENTION";
  explanation: string;
  metricData: string;
}

export interface AiDependencyOutput {
  overallDependencyScore: number;
  autonomyScore: number;
  category: DependencyCategory;
  categoryTitle: string;
  categoryBadge: string;
  categoryDescription: string;
  interviewSuccessProbability: number;
  employerSignalRating: "STRONG_BUY" | "SOLID_CONTRIBUTOR" | "SCREENING_RISK";
  employerPerceptionSummary: string;
  pillars: {
    promptAutonomy: DependencyPillar;
    projectExplanation: DependencyPillar;
    interviewArticulation: DependencyPillar;
  };
  actionableRemedies: {
    title: string;
    description: string;
    impact: "HIGH" | "MEDIUM";
  }[];
  dataSignalsSummary: {
    projectsAnalyzedCount: number;
    chatInteractionsCount: number;
    interviewSessionsCount: number;
    assessmentsEvaluatedCount: number;
    hasCalibrationData: boolean;
  };
}

export interface AdaptiveRecoveryOverviewResponse {
  simulator: RoadmapSimulatorOutput;
  recovery: ZeroGuiltRecoveryOutput;
  aiDependency: AiDependencyOutput;
}

/**
 * Retrieves the complete adaptive recovery overview (Simulator, Recovery Mode, AI Dependency).
 */
export const getAdaptiveRecoveryOverview = async (): Promise<AdaptiveRecoveryOverviewResponse> => {
  const res = await serverFetch("/api/adaptive-recovery/overview");
  return res.data;
};

/**
 * Retrieves the Roadmap Simulator pacing and ETA projection data.
 */
export const getSimulatorData = async (): Promise<RoadmapSimulatorOutput> => {
  const res = await serverFetch("/api/adaptive-recovery/simulator");
  return res.data;
};

/**
 * Updates learner's weekly available hours in CareerProfile.
 */
export const updateRoadmapPace = async (weeklyHours: number): Promise<RoadmapSimulatorOutput> => {
  const res = await serverMutation("/api/adaptive-recovery/pace", { weeklyHours }, "PATCH");
  return res.data;
};

/**
 * Retrieves the Zero-Guilt Recovery status and 4-day plan.
 */
export const getRecoveryStatus = async (): Promise<ZeroGuiltRecoveryOutput> => {
  const res = await serverFetch("/api/adaptive-recovery/recovery-status");
  return res.data;
};

/**
 * Activates or triggers recovery plan (with optional test simulation mode).
 */
export const startRecovery = async (simulate = false): Promise<ZeroGuiltRecoveryOutput> => {
  const res = await serverMutation("/api/adaptive-recovery/start-recovery", { simulate }, "POST");
  return res.data;
};

/**
 * Completes a specific step in the 4-day Zero-Guilt recovery plan.
 */
export const completeRecoveryStep = async (
  dayIndex: number,
  notes?: string
): Promise<ZeroGuiltRecoveryOutput> => {
  const res = await serverMutation("/api/adaptive-recovery/complete-step", { dayIndex, notes }, "POST");
  return res.data;
};

/**
 * Dismisses the recovery mode banner.
 */
export const dismissRecovery = async (): Promise<{ success: boolean }> => {
  return await serverMutation("/api/adaptive-recovery/dismiss-recovery", undefined, "POST");
};

/**
 * Retrieves the AI Dependency Analysis and live interview screening signal.
 */
export const getAiDependency = async (): Promise<AiDependencyOutput> => {
  const res = await serverFetch("/api/adaptive-recovery/ai-dependency");
  return res.data;
};

export const getAIDependency = async (): Promise<AIDependencyResult | null> => {
  try {
    const res = await serverFetch("/api/adaptive-recovery/ai-dependency");
    const d = res.data;
    if (!d) return null;
    return {
      score: d.overallDependencyScore ?? 35,
      category: d.category ?? "BALANCED",
      verdict: d.categoryDescription || d.categoryTitle || "Balanced AI Augmentation",
      badge: d.categoryBadge || d.categoryTitle || "🟡 Balanced AI Augmentation",
      advice: d.employerPerceptionSummary || "",
      pillars: {
        promptDelegation: d.pillars?.promptAutonomy?.score ?? 35,
        codeOwnership: d.pillars?.projectExplanation?.score ?? 70,
        liveProblemSolving: d.pillars?.interviewArticulation?.score ?? 65,
      },
    };
  } catch {
    return null;
  }
};

/* Compatibility types and client helpers for interactive landing page cards */
export interface RoadmapSimulationResult {
  weeklyHours: number;
  remainingHours: number;
  remainingMilestones: number;
  estimatedWeeks: number;
  estimatedMonths: number;
  projectedDate: string;
  paceTitle: string;
  paceBadge: string;
  velocityIndex: number;
}

export interface ZeroGuiltRecoveryResult {
  daysInactive: number;
  isRecoveryActive: boolean;
  streakShieldActive: boolean;
  bonusXpAmount: number;
  plan: {
    day: number;
    duration: string;
    title: string;
    subtitle: string;
    type: string;
    taskDetail: string;
  }[];
}

export interface AIDependencyResult {
  score: number;
  category: string;
  verdict: string;
  badge: string;
  advice: string;
  pillars: {
    promptDelegation: number;
    codeOwnership: number;
    liveProblemSolving: number;
  };
}

export const simulatePace = async (hours: number): Promise<RoadmapSimulationResult | null> => {
  try {
    const data = await getSimulatorData();
    if (!data) return null;
    return {
      weeklyHours: hours,
      remainingHours: data.remainingEstimatedHours || 120,
      remainingMilestones: data.remainingMilestones || 8,
      estimatedWeeks: data.currentPace?.weeksRemaining || Math.max(1, Math.ceil((data.remainingEstimatedHours || 120) / hours)),
      estimatedMonths: data.currentPace?.monthsRemaining || parseFloat((Math.max(1, Math.ceil((data.remainingEstimatedHours || 120) / hours)) / 4.3).toFixed(1)),
      projectedDate: data.currentPace?.completionDate || new Date().toISOString(),
      paceTitle: data.currentPace?.paceLabel || "Steady Pace",
      paceBadge: data.currentPace?.paceLabel || "🌱 Steady Pace",
      velocityIndex: Number((hours / 10).toFixed(1)),
    };
  } catch {
    return null;
  }
};

export const savePace = async (weeklyHours: number) => {
  return await serverMutation("/api/adaptive-recovery/pace", { weeklyHours }, "PATCH");
};

export const getRecoveryPlan = async (): Promise<ZeroGuiltRecoveryResult | null> => {
  try {
    const data = await getRecoveryStatus();
    if (!data) return null;
    return {
      daysInactive: data.daysInactive || 8,
      isRecoveryActive: data.isRecoveryActive || false,
      streakShieldActive: true,
      bonusXpAmount: 50,
      plan: data.steps?.map((s) => ({
        day: s.dayIndex,
        duration: `${s.estimatedMinutes || 10} Mins`,
        title: s.title,
        subtitle: s.subtitle,
        type: s.type,
        taskDetail: s.content?.description || s.title,
      })) || [],
    };
  } catch {
    return null;
  }
};

export const claimResilienceBonus = async () => {
  return await serverMutation("/api/adaptive-recovery/complete-step", { dayIndex: 4 }, "POST");
};
