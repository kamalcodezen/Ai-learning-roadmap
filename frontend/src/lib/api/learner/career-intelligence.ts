import { serverFetch } from "../../core/server";

export type CareerDecisionStatus = "APPLY_NOW" | "PREPARE_THEN_APPLY" | "BUILD_MORE_EVIDENCE" | "NOT_READY";
export type EvidenceQuality = "STRONG" | "MODERATE" | "WEAK" | "UNVERIFIED";
export type EvidenceFreshness = "FRESH" | "MODERATE" | "STALE" | "NONE";

export interface NextBestActionItem {
  type: "LEARN_SKILL" | "BUILD_PROJECT" | "ADD_TESTS" | "REFRESH_EVIDENCE" | "TAKE_DIAGNOSTIC" | "PRACTICE_INTERVIEW" | "APPLY_NOW";
  title: string;
  skillName: string;
  currentScore: number;
  expectedImpact: "HIGH" | "MEDIUM" | "LOW";
  estimatedEffortHours: number;
  actionUrl: string;
}

export interface CareerDecisionData {
  decision: CareerDecisionStatus;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  targetRole: string;
  readinessScore: number;
  employerConfidenceSignal: number;
  why: string[];
  nextBestAction: NextBestActionItem;
  simulation: {
    scenarioText: string;
    plannedHoursPerDay: number;
    plannedDays: number;
    projectedProofScoreGain: number;
    projectedReadinessGain: number;
    disclaimer: string;
  };
  confidence: number;
}

export interface SkillEvidenceItem {
  skillName: string;
  skillScore: number;
  proofScore: number;
  quality: EvidenceQuality;
  freshness: EvidenceFreshness;
  lastVerifiedAt: string | null;
  evidenceSources: {
    projectsCount: number;
    verifiedProjectsCount: number;
    diagnosticAnswersCount: number;
    hasInterviewProof: boolean;
  };
  recommendation?: string;
}

export interface VerificationOverviewData {
  overallSkillScore: number;
  overallProofScore: number;
  evidenceQuality: EvidenceQuality;
  evidenceConfidence: number;
  evidenceFreshness: EvidenceFreshness;
  employerConfidenceSignal: number;
  employerConfidenceExplanation: string;
  strongEvidenceSkillsCount: number;
  staleEvidenceSkillsCount: number;
  skills: SkillEvidenceItem[];
}

export const getCareerDecision = async (): Promise<CareerDecisionData> => {
  const res = await serverFetch(`/api/career-intelligence/decision`);
  return res?.data || res;
};

export const getEvidenceVerification = async (): Promise<VerificationOverviewData> => {
  const res = await serverFetch(`/api/career-intelligence/evidence-verification`);
  return res?.data || res;
};
