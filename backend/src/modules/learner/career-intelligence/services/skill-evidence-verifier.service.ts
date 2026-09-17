import prisma from "../../../../lib/prisma.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

export type EvidenceQuality = "STRONG" | "MODERATE" | "WEAK" | "UNVERIFIED";
export type EvidenceFreshness = "FRESH" | "MODERATE" | "STALE" | "NONE";

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
  recommendation?: string | undefined;
}

export interface VerificationOverview {
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

export const getSkillEvidenceVerification = async (userId: string): Promise<VerificationOverview> => {
  const [
    skillStates,
    projectEvidence,
    projects,
    diagnosticAttempts,
    interviewSessions,
    assessmentLogs,
    roadmaps,
  ] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.projectEvidence.findMany({
      where: { userId },
      include: { project: true },
    }),
    prisma.project.findMany({
      where: { userId },
    }),
    prisma.diagnosticAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        answers: {
          include: { question: true },
        },
      },
    }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.activityLog.findMany({
      where: { userId, type: "ASSESSMENT" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.roadmap.findMany({
      where: { userId },
      include: { milestones: true },
    }),
  ]);

  const safeSkillStates = skillStates || [];
  const safeProjectEvidence = projectEvidence || [];
  const safeProjects = projects || [];
  const safeDiagnosticAttempts = diagnosticAttempts || [];
  const safeInterviewSessions = interviewSessions || [];
  const safeAssessmentLogs = assessmentLogs || [];

  const activeRoadmap = roadmaps.find((r) => r.status === "ACTIVE") || roadmaps[0];
  const completedMilestones = activeRoadmap?.milestones.filter((m) => m.status === "COMPLETED") || [];
  const completedMilestoneSkills = new Set<string>();
  completedMilestones.forEach((m) => {
    (m.unlocks || []).forEach((u) => completedMilestoneSkills.add(u.toLowerCase()));
  });

  const now = new Date().getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const skills: SkillEvidenceItem[] = safeSkillStates.map((s) => {
    const skillName = s.skillName;

    // Filter evidence related to this skill
    const matchingEvidence = safeProjectEvidence.filter(
      (e) => e && e.skillName && isMatchingSkill(e.skillName, skillName)
    );
    const verifiedEvidence = matchingEvidence.filter((e) => e.project && e.project.isVerified);

    // Matching verified projects directly from Project records (by techStack)
    const matchingProjects = safeProjects.filter(
      (p) =>
        Array.isArray(p.techStack) &&
        p.techStack.some((tech) => isMatchingSkill(tech, skillName))
    );
    const verifiedProjects = matchingProjects.filter((p) => p.isVerified || (typeof p.score === "number" && p.score > 0));

    // Matching diagnostic correct answers
    const matchingDiagAnswers = safeDiagnosticAttempts.flatMap((attempt) =>
      (attempt.answers || []).filter(
        (ans) =>
          ans &&
          ans.isCorrect &&
          ans.question &&
          ans.question.skill &&
          isMatchingSkill(ans.question.skill, skillName)
      )
    );

    // Matching hands-on skill simulation assessments
    const matchingSimulations = safeAssessmentLogs.filter((log) => {
      const meta = log.metadata as any;
      if (!meta || typeof meta !== "object") return false;
      const isSim = meta.assessmentType === "skill_simulation" || meta.overallScore !== undefined;
      const skill = meta.skill || "";
      return Boolean(isSim && isMatchingSkill(skill, skillName));
    });

    // Milestone unlock verification
    const isMilestoneUnlocked = Array.from(completedMilestoneSkills).some((ms) =>
      isMatchingSkill(ms, skillName)
    );

    const hasInterviewProof = safeInterviewSessions.some((sess) => (sess.score || 0) >= 70);

    // Dynamic Mastery Score calculation based on active evaluated components
    const activeComps: number[] = [];
    if ((s.knowledgeScore || 0) > 0) activeComps.push(s.knowledgeScore);
    if ((s.practiceScore || 0) > 0) activeComps.push(s.practiceScore);
    if ((s.projectScore || 0) > 0) activeComps.push(s.projectScore);
    const skillScore = activeComps.length > 0
      ? Math.round(activeComps.reduce((a, b) => a + b, 0) / activeComps.length)
      : Math.round(
          (s.knowledgeScore || 0) * 0.4 + (s.practiceScore || 0) * 0.3 + (s.projectScore || 0) * 0.3
        );

    // Calculate Proof Score for this skill
    let proofScore = 0;
    if (verifiedProjects.length > 0 || verifiedEvidence.length > 0) proofScore += 40;
    else if (matchingProjects.length > 0 || matchingEvidence.length > 0) proofScore += 25;

    if (matchingSimulations.length > 0) {
      proofScore += 35;
    } else if (s.practiceScore && s.practiceScore >= 60) {
      proofScore += 25;
    }

    if (matchingDiagAnswers.length >= 3) {
      proofScore += 25;
    } else if (matchingDiagAnswers.length > 0) {
      proofScore += 20;
    } else if (s.knowledgeScore && s.knowledgeScore >= 70) {
      proofScore += 15;
    }

    if (isMilestoneUnlocked) {
      proofScore += 10;
    }

    if (hasInterviewProof) proofScore += 15;

    proofScore = Math.min(100, Math.max(proofScore, s.evidenceScore || 0));

    // Determine Quality
    let quality: EvidenceQuality = "UNVERIFIED";
    if (proofScore >= 70) {
      quality = "STRONG";
    } else if (proofScore >= 40) {
      quality = "MODERATE";
    } else if (skillScore > 0 || isMilestoneUnlocked) {
      quality = "WEAK";
    }

    // Determine Freshness based on most recent evidence timestamp
    const timestamps: number[] = [];
    matchingEvidence.forEach((e) => {
      if (e.createdAt) timestamps.push(new Date(e.createdAt).getTime());
      if (e.project && e.project.updatedAt) timestamps.push(new Date(e.project.updatedAt).getTime());
    });
    matchingProjects.forEach((p) => {
      if (p.updatedAt) timestamps.push(new Date(p.updatedAt).getTime());
      else if (p.createdAt) timestamps.push(new Date(p.createdAt).getTime());
    });
    matchingSimulations.forEach((sim) => {
      if (sim.createdAt) timestamps.push(new Date(sim.createdAt).getTime());
    });
    safeDiagnosticAttempts.forEach((d) => {
      if (d.completedAt) timestamps.push(new Date(d.completedAt).getTime());
    });

    let freshness: EvidenceFreshness = "NONE";
    let lastVerifiedAt: string | null = null;

    if (timestamps.length > 0) {
      const maxTime = Math.max(...timestamps);
      lastVerifiedAt = new Date(maxTime).toISOString();
      const ageDays = (now - maxTime) / DAY_MS;
      if (ageDays <= 30) freshness = "FRESH";
      else if (ageDays <= 180) freshness = "MODERATE";
      else freshness = "STALE";
    }

    let recommendation: string | undefined = undefined;
    if (freshness === "STALE") {
      recommendation = `Refresh evidence for ${skillName} with a new project or assessment.`;
    } else if (quality === "UNVERIFIED" || quality === "WEAK") {
      recommendation = `Build a verified project or complete a diagnostic to prove your ${skillName} skill.`;
    }

    return {
      skillName,
      skillScore,
      proofScore,
      quality,
      freshness,
      lastVerifiedAt,
      evidenceSources: {
        projectsCount: matchingProjects.length + matchingEvidence.length,
        verifiedProjectsCount: verifiedProjects.length + verifiedEvidence.length,
        diagnosticAnswersCount: matchingDiagAnswers.length,
        hasInterviewProof,
      },
      recommendation,
    };
  });

  const overallSkillScore = skills.length
    ? Math.round(skills.reduce((sum, item) => sum + item.skillScore, 0) / skills.length)
    : 0;

  const overallProofScore = skills.length
    ? Math.round(skills.reduce((sum, item) => sum + item.proofScore, 0) / skills.length)
    : 0;

  const strongEvidenceSkillsCount = skills.filter((s) => s.quality === "STRONG").length;
  const staleEvidenceSkillsCount = skills.filter((s) => s.freshness === "STALE").length;

  // Determine overall evidence quality
  let evidenceQuality: EvidenceQuality = "UNVERIFIED";
  if (skills.length > 0) {
    if (strongEvidenceSkillsCount >= 2 || (strongEvidenceSkillsCount > 0 && strongEvidenceSkillsCount >= skills.length * 0.2)) {
      evidenceQuality = "STRONG";
    } else if (skills.some((s) => s.quality === "MODERATE" || s.quality === "STRONG")) {
      evidenceQuality = "MODERATE";
    } else if (skills.some((s) => s.quality === "WEAK")) {
      evidenceQuality = "WEAK";
    }
  }

  // Determine overall evidence freshness
  let evidenceFreshness: EvidenceFreshness = "NONE";
  if (skills.length > 0) {
    if (staleEvidenceSkillsCount > 0 && staleEvidenceSkillsCount >= skills.length * 0.5) {
      evidenceFreshness = "STALE";
    } else if (skills.some((s) => s.freshness === "FRESH")) {
      evidenceFreshness = "FRESH";
    } else if (skills.some((s) => s.freshness === "MODERATE")) {
      evidenceFreshness = "MODERATE";
    } else if (skills.some((s) => s.freshness === "STALE")) {
      evidenceFreshness = "STALE";
    }
  }

  // Calculate Evidence Confidence (0-100)
  let evidenceConfidence = 0;
  if (skills.length > 0) {
    const hasVerifiedProjects = safeProjects.some((p) => p.isVerified || (p.score && p.score > 0)) || safeProjectEvidence.some((e) => e.project && e.project.isVerified);
    const projectConfidence = hasVerifiedProjects ? 35 : (safeProjects.length > 0 || safeProjectEvidence.length > 0 ? 20 : 0);
    const diagConfidence = safeDiagnosticAttempts.length > 0 ? 30 : 0;
    const simConfidence = safeAssessmentLogs.length > 0 ? 25 : 0;
    const freshnessBonus = evidenceFreshness === "FRESH" ? 10 : evidenceFreshness === "MODERATE" ? 5 : 0;
    evidenceConfidence = Math.min(100, projectConfidence + diagConfidence + simConfidence + freshnessBonus);
  }

  // Compute Employer Confidence Signal
  const employerConfidenceSignal = Math.min(
    100,
    Math.round(overallSkillScore * 0.4 + overallProofScore * 0.45 + (strongEvidenceSkillsCount > 0 ? 15 : 0))
  );

  const employerConfidenceExplanation =
    "This signal summarizes the strength, verification, and freshness of your portfolio & assessment evidence. It is an internal readiness measure, not a guaranteed hiring prediction.";

  return {
    overallSkillScore,
    overallProofScore,
    evidenceQuality,
    evidenceConfidence,
    evidenceFreshness,
    employerConfidenceSignal,
    employerConfidenceExplanation,
    strongEvidenceSkillsCount,
    staleEvidenceSkillsCount,
    skills,
  };
};
