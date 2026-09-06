import prisma from "../../../../lib/prisma.js";

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
  const [skillStates, projectEvidence, diagnosticAttempts, interviewSessions] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.projectEvidence.findMany({
      where: { userId },
      include: { project: true },
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
  ]);

  const safeSkillStates = skillStates || [];
  const safeProjectEvidence = projectEvidence || [];
  const safeDiagnosticAttempts = diagnosticAttempts || [];
  const safeInterviewSessions = interviewSessions || [];

  const now = new Date().getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const skills: SkillEvidenceItem[] = safeSkillStates.map((s) => {
    const skillName = s.skillName;
    const skillScore = Math.round(
      (s.knowledgeScore || 0) * 0.4 + (s.practiceScore || 0) * 0.3 + (s.projectScore || 0) * 0.3
    );

    // Filter evidence related to this skill
    const matchingEvidence = safeProjectEvidence.filter(
      (e) => e && e.skillName && e.skillName.toLowerCase() === skillName.toLowerCase()
    );
    const verifiedEvidence = matchingEvidence.filter((e) => e.project && e.project.isVerified);

    // Matching diagnostic correct answers
    const matchingDiagAnswers = safeDiagnosticAttempts.flatMap((attempt) =>
      (attempt.answers || []).filter(
        (ans) =>
          ans &&
          ans.isCorrect &&
          ans.question &&
          ans.question.skill &&
          ans.question.skill.toLowerCase() === skillName.toLowerCase()
      )
    );

    const hasInterviewProof = safeInterviewSessions.some((sess) => (sess.score || 0) >= 70);

    // Calculate Proof Score for this skill
    let proofScore = 0;
    if (verifiedEvidence.length > 0) proofScore += 50;
    else if (matchingEvidence.length > 0) proofScore += 25;

    if (matchingDiagAnswers.length >= 3) proofScore += 35;
    else if (matchingDiagAnswers.length > 0) proofScore += 20;

    if (hasInterviewProof) proofScore += 15;
    proofScore = Math.min(100, proofScore);

    // Determine Quality
    let quality: EvidenceQuality = "UNVERIFIED";
    if (verifiedEvidence.length > 0 && matchingDiagAnswers.length > 0) {
      quality = "STRONG";
    } else if (matchingEvidence.length > 0 || matchingDiagAnswers.length > 0) {
      quality = "MODERATE";
    } else if (s.knowledgeScore > 0 || s.practiceScore > 0) {
      quality = "WEAK";
    }

    // Determine Freshness based on most recent evidence timestamp
    const timestamps: number[] = [];
    matchingEvidence.forEach((e) => {
      if (e.createdAt) timestamps.push(new Date(e.createdAt).getTime());
      if (e.project && e.project.updatedAt) timestamps.push(new Date(e.project.updatedAt).getTime());
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
        projectsCount: matchingEvidence.length,
        verifiedProjectsCount: verifiedEvidence.length,
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
    if (strongEvidenceSkillsCount >= 2 || (strongEvidenceSkillsCount > 0 && strongEvidenceSkillsCount >= skills.length * 0.3)) {
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
    const verifiedProjects = safeProjectEvidence.filter((e) => e.project && e.project.isVerified).length;
    const projectConfidence = safeProjectEvidence.length > 0
      ? Math.min(40, Math.round((verifiedProjects / safeProjectEvidence.length) * 40))
      : 0;
    const diagConfidence = safeDiagnosticAttempts.length > 0 ? 30 : 0;
    const interviewConfidence = safeInterviewSessions.some((s) => (s.score || 0) >= 65) ? 20 : 0;
    const freshnessBonus = evidenceFreshness === "FRESH" ? 10 : evidenceFreshness === "MODERATE" ? 5 : 0;
    evidenceConfidence = Math.min(100, projectConfidence + diagConfidence + interviewConfidence + freshnessBonus);
  }

  // Compute Employer Confidence Signal
  const employerConfidenceSignal = Math.min(
    100,
    Math.round(overallSkillScore * 0.35 + overallProofScore * 0.5 + (strongEvidenceSkillsCount > 0 ? 15 : 0))
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
