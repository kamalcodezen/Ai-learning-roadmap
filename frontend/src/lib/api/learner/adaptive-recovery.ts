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
