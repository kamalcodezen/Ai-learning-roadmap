import prisma from "../../../../lib/prisma.js";
import {
  classifySkillScore,
  classifySkillGapSeverity,
  classifySkillGapLevel,
  type SkillProficiencyStatus,
  type SkillGapSeverity,
  type SkillGapLevel,
} from "../constants/diagnostic-thresholds.js";
import { getSkillGaps } from "../../skill-gaps/services/skill-gaps.service.js";

export interface DiagnosticSkillScore {
  skill: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: SkillProficiencyStatus;
  gapLevel: SkillGapLevel;
}

export interface CommunicationEvaluationDetails {
  isAvailable: boolean;
  score: number;
  clarity: number;
  structure: number;
  technicalExplanation: number;
  relevance: number;
  completeness: number;
  feedback: string;
  transcript: string;
  question: string;
}

export interface DiagnosticSkillGapItem {
  skill: string;
  score: number;
  status: SkillProficiencyStatus;
  severity: SkillGapSeverity;
  gapLevel: SkillGapLevel;
  reason: string;
  evidence: string;
  recommendedAction: string;
  href: string;
}

export interface DiagnosticRecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionText: string;
  actionUrl: string;
  skillName?: string;
}

export interface DiagnosticResultOutput {
  id: string;
  userId: string;
  targetRole: string | null;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  overallScore: number;
  correctAnswers: number;
  mcqCount: number;
  startedAt: Date;
  completedAt: Date | null;
  skills: DiagnosticSkillScore[];
  strengths: DiagnosticSkillScore[];
  mediumSkills: DiagnosticSkillScore[];
  weakSkills: DiagnosticSkillScore[];
  skillGaps: DiagnosticSkillGapItem[];
  communication: CommunicationEvaluationDetails;
  recommendations: DiagnosticRecommendationItem[];
}

/**
 * Build rich, dynamic Diagnostic Result from real persisted learner data
 */
export const getDiagnosticResult = async (
  attemptId: string,
  userId: string,
): Promise<DiagnosticResultOutput> => {
  // 1. Fetch attempt and enforce ownership
  const attempt = await prisma.diagnosticAttempt.findFirst({
    where: {
      id: attemptId,
      userId: userId,
    },
    include: {
      answers: {
        include: { question: true },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (!attempt) {
    throw new Error("Diagnostic attempt not found or unauthorized.");
  }

  const answers = attempt.answers || [];

  // 2. Separate MCQ answers (order 1..5) and Communication answer (order 6)
  const mcqAnswers = answers.filter((a) => a.question && a.question.order !== 6);
  const commAnswer = answers.find((a) => a.question && a.question.order === 6);

  // 3. Dynamic Skill-wise scoring from persisted MCQ answers
  const skillGrouping: Record<
    string,
    {
      category: string;
      total: number;
      correct: number;
    }
  > = {};

  let mcqCorrect = 0;
  for (const ans of mcqAnswers) {
    const skillName = ans.question.skill || ans.question.category || "General";
    if (!skillGrouping[skillName]) {
      skillGrouping[skillName] = {
        category: ans.question.category || "Core",
        total: 0,
        correct: 0,
      };
    }
    skillGrouping[skillName].total++;
    if (ans.isCorrect) {
      skillGrouping[skillName].correct++;
      mcqCorrect++;
    }
  }

  const mcqTotal = mcqAnswers.length;
  const overallScore =
    attempt.score !== null && attempt.score !== undefined
      ? attempt.score
      : mcqTotal > 0
      ? Math.round((mcqCorrect / mcqTotal) * 100)
      : 0;

  const skills: DiagnosticSkillScore[] = Object.entries(skillGrouping).map(
    ([skill, stats]) => {
      const score =
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return {
        skill,
        category: stats.category,
        score,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        status: classifySkillScore(score),
        gapLevel: classifySkillGapLevel(score),
      };
    },
  );

  // Sort by score descending
  skills.sort((a, b) => b.score - a.score);

  const strengths = skills.filter((s) => s.status === "STRONG");
  const mediumSkills = skills.filter((s) => s.status === "MEDIUM");
  const weakSkills = skills.filter((s) => s.status === "WEAK");

  // 4. Actual Skill Gap Detection
  // Fetch existing skill gaps from existing Skill Gap service if possible
  let globalSkillGaps: Array<{ skill: string; reason: string; severity: string; recommendedAction: string; href: string }> = [];
  try {
    const gapsResult = await getSkillGaps(userId);
    if (gapsResult && Array.isArray(gapsResult.gaps)) {
      globalSkillGaps = gapsResult.gaps;
    }
  } catch (err) {
    console.warn("Could not retrieve global skill gaps for context:", err);
  }

  // Diagnostic-identified skill gaps (skills with WEAK or MEDIUM status)
  const nonStrongSkills = skills.filter((s) => s.status !== "STRONG");
  const skillGaps: DiagnosticSkillGapItem[] = nonStrongSkills.map((s) => {
    const matchedGap = globalSkillGaps.find(
      (g) => g.skill.toLowerCase() === s.skill.toLowerCase(),
    );

    const severity = classifySkillGapSeverity(s.score);
    const gapLevel = classifySkillGapLevel(s.score);

    let defaultReason = "";
    if (s.status === "WEAK") {
      defaultReason = `Diagnostic performance showed significant gaps (${s.score}%). Core concepts require fundamental review and structured practice.`;
    } else {
      defaultReason = `Demonstrated working foundation (${s.score}%), but requires additional practice and project application to reach production readiness.`;
    }

    return {
      skill: s.skill,
      score: s.score,
      status: s.status,
      severity: severity,
      gapLevel: gapLevel,
      reason: matchedGap?.reason || defaultReason,
      evidence: `Diagnostic Assessment: ${s.correctAnswers}/${s.totalQuestions} questions correct (${s.score}%)`,
      recommendedAction: matchedGap?.recommendedAction || `Start ${s.skill} Learning Path`,
      href: matchedGap?.href || "/dashboard/learner/learning-path",
    };
  });

  // Sort skill gaps by severity (critical first) and then ascending score
  skillGaps.sort((a, b) => {
    if (a.gapLevel === "HIGH" && b.gapLevel !== "HIGH") return -1;
    if (b.gapLevel === "HIGH" && a.gapLevel !== "HIGH") return 1;
    return a.score - b.score;
  });

  // 5. Communication Question Handling (Order 6)
  // Reuse stored evaluation JSON — NO duplicate AI calls
  let communication: CommunicationEvaluationDetails = {
    isAvailable: false,
    score: 0,
    clarity: 0,
    structure: 0,
    technicalExplanation: 0,
    relevance: 0,
    completeness: 0,
    feedback: "Communication evaluation is not available yet.",
    transcript: commAnswer?.selectedAnswer || "",
    question: commAnswer?.question?.question || "Open-ended Technical Communication Question",
  };

  if (commAnswer) {
    communication.transcript = commAnswer.selectedAnswer || "";
    communication.question =
      commAnswer.question?.question ||
      "Explain a technical architecture or system design concept.";

    const rawEval = commAnswer.evaluation as any;
    if (rawEval && typeof rawEval === "object") {
      const clarity = Math.min(100, Math.max(0, Number(rawEval.clarity) || 0));
      const structure = Math.min(100, Math.max(0, Number(rawEval.structure) || 0));
      const technicalExplanation = Math.min(
        100,
        Math.max(0, Number(rawEval.technicalExplanation) || 0),
      );
      const relevance = Math.min(100, Math.max(0, Number(rawEval.relevance) || 0));
      const completeness = Math.min(
        100,
        Math.max(0, Number(rawEval.completeness) || 0),
      );
      const evalScore = Math.min(
        100,
        Math.max(
          0,
          Number(rawEval.score) ||
            Math.round(
              (clarity + structure + technicalExplanation + relevance + completeness) / 5,
            ),
        ),
      );

      communication = {
        isAvailable: true,
        score: evalScore,
        clarity,
        structure,
        technicalExplanation,
        relevance,
        completeness,
        feedback:
          typeof rawEval.feedback === "string" && rawEval.feedback.trim()
            ? rawEval.feedback.trim()
            : "Explanation evaluated across technical clarity and communication structure.",
        transcript: commAnswer.selectedAnswer || "",
        question: commAnswer.question?.question || communication.question,
      };
    }
  }

  // 6. Personalized Dynamic Recommendations
  const recommendations: DiagnosticRecommendationItem[] = [];

  // Weak skill recommendations (Priority HIGH)
  for (const weak of weakSkills) {
    recommendations.push({
      id: `rec-weak-${weak.skill.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Master ${weak.skill} Fundamentals`,
      description: `You scored ${weak.score}% in ${weak.skill}. Focus on foundational modules and guided coding exercises to close this critical gap.`,
      priority: "HIGH",
      actionText: "Open Learning Path",
      actionUrl: "/dashboard/learner/learning-path",
      skillName: weak.skill,
    });
  }

  // Communication recommendation if evaluated and score < 70
  if (communication.isAvailable && communication.score < 75) {
    recommendations.push({
      id: "rec-communication",
      title: "Elevate Technical Communication & Articulation",
      description: `Your communication assessment scored ${communication.score}%. Practice structuring explanations using the STAR method and speaking with architectural precision.`,
      priority: communication.score < 50 ? "HIGH" : "MEDIUM",
      actionText: "Practice Technical Interviews",
      actionUrl: "/dashboard/learner/assessments",
    });
  }

  // Medium skill recommendations (Priority MEDIUM)
  for (const med of mediumSkills) {
    recommendations.push({
      id: `rec-med-${med.skill.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Reinforce ${med.skill} with Practical Projects`,
      description: `Solid baseline demonstrated (${med.score}%). Cement your skills by building end-to-end features and verifying proof artifacts.`,
      priority: "MEDIUM",
      actionText: "View Recommended Projects",
      actionUrl: "/dashboard/learner/portfolio",
      skillName: med.skill,
    });
  }

  // Fallback recommendation if learner scored high in everything
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-advanced",
      title: "Accelerate to Production Evidence & Proof Verification",
      description: "You demonstrated strong diagnostic proficiency across evaluated skills. Advance to building portfolio projects and verifying GitHub commits.",
      priority: "LOW",
      actionText: "Build Verified Projects",
      actionUrl: "/dashboard/learner/portfolio",
    });
  }

  return {
    id: attempt.id,
    userId: attempt.userId,
    targetRole: attempt.targetRole,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    answeredQuestions: attempt.answeredQuestions,
    overallScore,
    correctAnswers: mcqCorrect,
    mcqCount: mcqTotal,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    skills,
    strengths,
    mediumSkills,
    weakSkills,
    skillGaps,
    communication,
    recommendations,
  };
};

/**
 * Fetch latest completed diagnostic result for an authenticated user
 */
export const getLatestDiagnosticResult = async (
  userId: string,
): Promise<DiagnosticResultOutput | null> => {
  const latestAttempt = await prisma.diagnosticAttempt.findFirst({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
    select: { id: true },
  });

  if (!latestAttempt) {
    return null;
  }

  return getDiagnosticResult(latestAttempt.id, userId);
};
