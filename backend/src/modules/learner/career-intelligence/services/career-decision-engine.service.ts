import prisma from "../../../../lib/prisma.js";
import { getSkillEvidenceVerification } from "./skill-evidence-verifier.service.js";
import type { SkillEvidenceItem } from "./skill-evidence-verifier.service.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

export type CareerDecisionStatus = "APPLY_NOW" | "PREPARE_THEN_APPLY" | "BUILD_MORE_EVIDENCE" | "NOT_READY";

export interface NextBestActionItem {
  type: "LEARN_SKILL" | "BUILD_PROJECT" | "ADD_TESTS" | "REFRESH_EVIDENCE" | "TAKE_DIAGNOSTIC" | "PRACTICE_INTERVIEW" | "APPLY_NOW";
  title: string;
  skillName: string;
  currentScore: number;
  expectedImpact: "HIGH" | "MEDIUM" | "LOW";
  estimatedEffortHours: number;
  actionUrl: string;
}

export interface CareerDecisionOutput {
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

export const getCareerDecision = async (userId: string): Promise<CareerDecisionOutput> => {
  const [profile, evidenceVerification, readiness, skillStates, diagnosticAttempts, interviewSessions] =
    await Promise.all([
      prisma.careerProfile.findUnique({ where: { userId } }),
      getSkillEvidenceVerification(userId),
      getCareerReadiness(userId),
      prisma.skillState.findMany({ where: { userId } }),
      prisma.diagnosticAttempt.findMany({ where: { userId, status: "COMPLETED" } }),
      prisma.interviewSession.findMany({ where: { userId, status: "COMPLETED" } }),
    ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Software Engineer";
  const readinessScore = readiness.score || 0;
  const confidenceSignal = evidenceVerification.employerConfidenceSignal;
  const overallSkill = evidenceVerification.overallSkillScore;
  const overallProof = evidenceVerification.overallProofScore;

  // Decision State Logic
  let decision: CareerDecisionStatus = "NOT_READY";
  let priority: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
  let title = "";

  const interviewScores = interviewSessions
    .map((s: { score?: number | null }) => s.score)
    .filter((score): score is number => typeof score === "number" && !isNaN(score));
  const avgInterviewScore = interviewScores.length
    ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
    : null;

  if (
    readinessScore >= 70 &&
    (confidenceSignal >= 60 || overallProof >= 60) &&
    (avgInterviewScore === null || avgInterviewScore >= 65)
  ) {
    decision = "APPLY_NOW";
    priority = "LOW";
    title = `Strong readiness signals for ${targetRole} positions. Recommend active applications.`;
  } else if (overallSkill >= 40 && overallProof < 40) {
    decision = "BUILD_MORE_EVIDENCE";
    priority = "HIGH";
    title = `High skill competence detected, but verified evidence is lacking for ${targetRole}.`;
  } else if (
    (readinessScore >= 45 && (confidenceSignal >= 45 || overallProof >= 40)) ||
    (overallSkill >= 50 && overallProof >= 40)
  ) {
    decision = "PREPARE_THEN_APPLY";
    priority = "MEDIUM";
    title = `Good baseline for ${targetRole}. Focus on targeted gap closure before applying.`;
  } else {
    decision = "NOT_READY";
    priority = "HIGH";
    title = `Building fundamental skills and initial project portfolio for ${targetRole}.`;
  }

  // Determine Rationale (Why?)
  const why: string[] = [];
  if (readiness.weakSkills.length > 0) {
    why.push(`Critical skill gaps identified in ${readiness.weakSkills.join(", ")}.`);
  }
  if (evidenceVerification.staleEvidenceSkillsCount > 0) {
    why.push(`${evidenceVerification.staleEvidenceSkillsCount} skill(s) have stale evidence older than 6 months.`);
  }
  if (overallSkill > overallProof + 20) {
    why.push(`Your claimed skill score (${overallSkill}%) exceeds your verified proof score (${overallProof}%).`);
  }
  if (diagnosticAttempts.length === 0) {
    why.push("Diagnostic assessment has not yet been completed to establish baseline competence.");
  }
  if (interviewSessions.length === 0) {
    why.push("No technical mock interview attempts recorded.");
  } else if (avgInterviewScore !== null && avgInterviewScore < 70) {
    why.push(`Mock interview average score (${avgInterviewScore}%) is below the recommended threshold (70%).`);
  }
  if (why.length === 0) {
    why.push(`Target role ${targetRole} requires balanced knowledge, evidence, and interview performance.`);
  }

  // Determine Next Best Action
  let nextBestAction: NextBestActionItem;

  const weakestSkill = (skillStates || []).sort(
    (a: { knowledgeScore?: number }, b: { knowledgeScore?: number }) =>
      (a.knowledgeScore || 0) - (b.knowledgeScore || 0)
  )[0];

  const staleSkill = evidenceVerification.skills.find((s: SkillEvidenceItem) => s.freshness === "STALE");
  const lowProofSkill = evidenceVerification.skills.find(
    (s: SkillEvidenceItem) => s.skillScore >= 60 && s.proofScore < 40
  );

  if (decision === "APPLY_NOW") {
    nextBestAction = {
      type: "APPLY_NOW",
      title: `Begin Targeted Applications for ${targetRole}`,
      skillName: targetRole,
      currentScore: readinessScore,
      expectedImpact: "HIGH",
      estimatedEffortHours: 10,
      actionUrl: "/dashboard/learner/career-intelligence",
    };
  } else if (diagnosticAttempts.length === 0) {
    nextBestAction = {
      type: "TAKE_DIAGNOSTIC",
      title: "Take Diagnostic Assessment",
      skillName: "General Baseline",
      currentScore: 0,
      expectedImpact: "HIGH",
      estimatedEffortHours: 1,
      actionUrl: "/diagnostic",
    };
  } else if (weakestSkill && (weakestSkill.knowledgeScore || 0) < 40) {
    nextBestAction = {
      type: "LEARN_SKILL",
      title: `Master ${weakestSkill.skillName} Fundamentals`,
      skillName: weakestSkill.skillName,
      currentScore: Math.round(weakestSkill.knowledgeScore || 0),
      expectedImpact: "HIGH",
      estimatedEffortHours: 12,
      actionUrl: "/dashboard/learner/skill-gaps",
    };
  } else if (decision === "BUILD_MORE_EVIDENCE") {
    const targetEvidenceSkill =
      lowProofSkill ||
      evidenceVerification.skills.find((s: SkillEvidenceItem) => s.proofScore < 40) ||
      weakestSkill;
    const skillName = targetEvidenceSkill?.skillName || targetRole;
    nextBestAction = {
      type: "BUILD_PROJECT",
      title: `Build a Verified Project with ${skillName}`,
      skillName,
      currentScore: targetEvidenceSkill ? ("proofScore" in targetEvidenceSkill ? targetEvidenceSkill.proofScore : 0) : overallProof,
      expectedImpact: "HIGH",
      estimatedEffortHours: 15,
      actionUrl: "/dashboard/learner/portfolio",
    };
  } else if (lowProofSkill) {
    nextBestAction = {
      type: "BUILD_PROJECT",
      title: `Build a Verified Project with ${lowProofSkill.skillName}`,
      skillName: lowProofSkill.skillName,
      currentScore: lowProofSkill.proofScore,
      expectedImpact: "HIGH",
      estimatedEffortHours: 15,
      actionUrl: "/dashboard/learner/portfolio",
    };
  } else if (staleSkill) {
    nextBestAction = {
      type: "REFRESH_EVIDENCE",
      title: `Refresh Stale Evidence for ${staleSkill.skillName}`,
      skillName: staleSkill.skillName,
      currentScore: staleSkill.proofScore,
      expectedImpact: "MEDIUM",
      estimatedEffortHours: 8,
      actionUrl: "/dashboard/learner/proof-graph",
    };
  } else if (weakestSkill && (weakestSkill.knowledgeScore || 0) < 60) {
    nextBestAction = {
      type: "LEARN_SKILL",
      title: `Strengthen ${weakestSkill.skillName} Knowledge`,
      skillName: weakestSkill.skillName,
      currentScore: Math.round(weakestSkill.knowledgeScore || 0),
      expectedImpact: "HIGH",
      estimatedEffortHours: 10,
      actionUrl: "/dashboard/learner/learning-path",
    };
  } else if (avgInterviewScore !== null && avgInterviewScore < 70) {
    nextBestAction = {
      type: "PRACTICE_INTERVIEW",
      title: `Improve Technical Interview Score for ${targetRole}`,
      skillName: "Technical Interview",
      currentScore: avgInterviewScore,
      expectedImpact: "HIGH",
      estimatedEffortHours: 3,
      actionUrl: "/dashboard/learner/interview",
    };
  } else if (interviewSessions.length === 0 && overallSkill >= 50) {
    nextBestAction = {
      type: "PRACTICE_INTERVIEW",
      title: `Complete a Mock Interview for ${targetRole}`,
      skillName: "Interview Readiness",
      currentScore: 0,
      expectedImpact: "HIGH",
      estimatedEffortHours: 2,
      actionUrl: "/dashboard/learner/interview",
    };
  } else {
    nextBestAction = {
      type: "BUILD_PROJECT",
      title: "Build Capstone Project",
      skillName: targetRole,
      currentScore: overallProof,
      expectedImpact: "HIGH",
      estimatedEffortHours: 20,
      actionUrl: "/dashboard/learner/portfolio",
    };
  }

  // Simulation: What-If 2 hours/day for 30 days
  const projectedProofScoreGain = Math.min(25, Math.round(nextBestAction.estimatedEffortHours * 1.2));
  const projectedReadinessGain = Math.min(20, Math.round(nextBestAction.estimatedEffortHours * 0.9));

  return {
    decision,
    priority,
    title,
    targetRole,
    readinessScore,
    employerConfidenceSignal: confidenceSignal,
    why,
    nextBestAction,
    simulation: {
      scenarioText: `If you dedicate 2 hours/day for 30 days toward ${nextBestAction.title}`,
      plannedHoursPerDay: 2,
      plannedDays: 30,
      projectedProofScoreGain,
      projectedReadinessGain,
      disclaimer: "Projected estimates based on historical progress and planned effort. Not a hiring guarantee.",
    },
    confidence: 0.88,
  };
};
