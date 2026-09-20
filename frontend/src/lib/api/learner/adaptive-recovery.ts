import { serverFetch } from "../../core/server";

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

export const simulatePace = async (hours: number): Promise<RoadmapSimulationResult> => {
  return await serverFetch(`/api/adaptive-recovery/simulate?hours=${hours}`);
};

export const savePace = async (weeklyHours: number) => {
  return await serverFetch(`/api/adaptive-recovery/save-pace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weeklyHours }),
  });
};

export const getRecoveryPlan = async (): Promise<ZeroGuiltRecoveryResult> => {
  return await serverFetch(`/api/adaptive-recovery/recovery-plan`);
};

export const claimResilienceBonus = async () => {
  return await serverFetch(`/api/adaptive-recovery/claim-bonus`, {
    method: "POST",
  });
};

export const getAIDependency = async (): Promise<AIDependencyResult> => {
  return await serverFetch(`/api/adaptive-recovery/ai-dependency`);
};
