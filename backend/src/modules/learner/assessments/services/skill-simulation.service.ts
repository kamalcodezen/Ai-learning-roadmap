import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";
import { getSkillGaps } from "../../skill-gaps/services/skill-gaps.service.js";
import { z } from "zod";

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface SimulationStageUnderstand {
  stage: "understand";
  title: string;
  question: string;
  context?: string | undefined;
  options: string[];
}

export interface SimulationStageDebug {
  stage: "debug";
  title: string;
  question: string;
  codeSnippet: string;
  options: string[];
}

export interface SimulationStageCode {
  stage: "code";
  title: string;
  question: string;
  starterCode: string;
  instructions: string[];
}

export interface SimulationStageExplain {
  stage: "explain";
  title: string;
  question: string;
  context?: string | undefined;
  placeholder?: string | undefined;
}

export interface SkillSimulation {
  skill: string;
  targetRole?: string;
  difficulty?: string;
  title: string;
  description: string;
  stages: {
    understand: SimulationStageUnderstand;
    debug: SimulationStageDebug;
    code: SimulationStageCode;
    explain: SimulationStageExplain;
  };
}

export interface SimulationSubmissionAnswers {
  understandAnswer: string;
  debugAnswer: string;
  codeAnswer: string;
  explainAnswer: string;
}

export interface SimulationResult {
  skill: string;
  targetRole?: string;
  difficulty?: string;
  overallScore: number;
  stageBreakdown: {
    understand: number;
    debug: number;
    code: number;
    explain: number;
  };
  strongAreas: string[];
  needsPractice: string[];
  feedback: string;
  completedAt: string;
}

// ============================================================
// STRICT AI GENERATION SCHEMA (ZOD)
// ============================================================

const AiGeneratedSimulationSchema = z.object({
  title: z.string(),
  description: z.string(),
  understand: z.object({
    question: z.string(),
    options: z.array(z.string()).min(4).max(4),
    correctAnswer: z.string(),
  }),
  debug: z.object({
    question: z.string(),
    codeSnippet: z.string(),
    options: z.array(z.string()).min(4).max(4),
    correctAnswer: z.string(),
  }),
  code: z.object({
    question: z.string(),
    starterCode: z.string(),
    instructions: z.array(z.string()).min(2),
    requiredPatterns: z.array(z.string()).min(2),
  }),
  explain: z.object({
    question: z.string(),
    placeholder: z.string().optional(),
    keyConcepts: z.array(z.string()).min(2),
  }),
});

// ============================================================
// DYNAMIC AI SIMULATION GENERATOR (NO FIXED QUESTION BANK)
// ============================================================

/**
 * Dynamically resolves the learner context (Target Role, SkillState, Gap Severity, Difficulty)
 * and generates a fully personalized 4-stage Skill Mastery Simulation using AI.
 * Results are cached in ActivityLog (SKILL_SIMULATION_ACTIVE) to prevent duplicate AI calls
 * on page refresh or TanStack Query refetches.
 */
export async function getSkillSimulation(userId: string, skillName: string): Promise<SkillSimulation> {
  const normSkill = skillName.trim();

  // 1. Check if there is an active (unsubmitted) simulation already generated for this skill
  const activeLogs = await prisma.activityLog.findMany({
    where: {
      userId,
      type: "SKILL_SIMULATION_ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const cachedLog = activeLogs.find((log) => {
    const meta = log.metadata as any;
    return meta?.skill && meta.skill.toLowerCase() === normSkill.toLowerCase();
  });

  if (cachedLog && cachedLog.metadata) {
    const meta = cachedLog.metadata as any;
    if (meta.simulationData) {
      return meta.simulationData as SkillSimulation;
    }
  }

  // 2. Resolve Dynamic Learner Context from Database
  const [profile, roadmap, skillState, skillGaps] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.roadmap.findFirst({ where: { userId, status: "ACTIVE" } }),
    prisma.skillState.findFirst({
      where: {
        userId,
        skillName: { equals: normSkill, mode: "insensitive" },
      },
    }),
    getSkillGaps(userId).catch(() => ({ gaps: [] as any[], overallHealth: 0 })),
  ]);

  const targetRole = roadmap?.targetRole || profile?.targetRoleName || profile?.targetRole || "Full Stack Developer";
  const currentScore = skillState ? Math.round((skillState.knowledgeScore + skillState.practiceScore) / 2) : 0;

  const gap = skillGaps.gaps.find(
    (g: any) =>
      g.skill.toLowerCase().includes(normSkill.toLowerCase()) ||
      normSkill.toLowerCase().includes(g.skill.toLowerCase())
  );
  const gapSeverity = gap?.severity || (currentScore < 40 ? "CRITICAL" : currentScore < 70 ? "MODERATE" : "LOW");

  const weakAreas =
    gap?.reason ||
    (currentScore < 40
      ? "Core principles, syntax, baseline execution"
      : "Edge cases, debugging, advanced optimization");

  // Calibrate difficulty based on learner proficiency
  let difficulty = "foundational";
  if (currentScore > 80) difficulty = "mastery";
  else if (currentScore > 60) difficulty = "advanced";
  else if (currentScore > 30) difficulty = "intermediate";

  // 3. Construct Context-Aware AI Generation Prompt
  const systemInstruction = `You are a Principal Software Engineering Assessor designing a personalized 4-stage technical skill simulation for a candidate.

Context:
- Target Career Role: "${targetRole}"
- Target Skill: "${normSkill}"
- Current Skill Score: ${currentScore}%
- Skill Gap Severity: ${gapSeverity}
- Weak Areas / Focus Topics: "${weakAreas}"
- Calibrated Difficulty: ${difficulty}

CRITICAL RULES:
1. Every stage MUST be relevant to "${normSkill}" as applied in the professional context of "${targetRole}".
2. Calibrate difficulty to "${difficulty}".
3. Stage 1 (Understand): A conceptual multiple-choice question testing theoretical principles and edge cases. Exactly 4 options, 1 correctAnswer matching one option exactly.
4. Stage 2 (Debug): A realistic buggy code snippet or query with an authentic flaw. Exactly 4 options, 1 correctAnswer explaining the root cause and fix.
5. Stage 3 (Code): A practical coding or query implementation challenge. Provide "starterCode", "instructions" array (at least 2 items), and "requiredPatterns" array (at least 2 code keywords/patterns required in a valid solution).
6. Stage 4 (Explain): A technical explanation challenge asking the candidate to articulate architecture, trade-offs, or performance considerations. Include "keyConcepts" array (at least 2 terms).

Return ONLY valid JSON matching this exact structure:
{
  "title": "${normSkill} Mastery Simulation (${targetRole})",
  "description": "Evaluate your practical ability to understand, debug, code, and explain ${normSkill} in a ${targetRole} context.",
  "understand": {
    "question": "...",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "correctAnswer": "exact string of correct option"
  },
  "debug": {
    "question": "...",
    "codeSnippet": "...",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "correctAnswer": "exact string of correct option"
  },
  "code": {
    "question": "...",
    "starterCode": "...",
    "instructions": ["...", "..."],
    "requiredPatterns": ["pattern1", "pattern2"]
  },
  "explain": {
    "question": "...",
    "placeholder": "...",
    "keyConcepts": ["concept1", "concept2"]
  }
}`;

  const userPrompt = `Generate a rigorous, authentic 4-stage skill mastery simulation for skill: "${normSkill}" targeted for candidate aiming to be "${targetRole}" at "${difficulty}" level. Return only valid JSON.`;

  let parsed: z.infer<typeof AiGeneratedSimulationSchema>;

  try {
    const aiResponse = await ChatService.processJsonCompletion(systemInstruction, userPrompt);
    const rawJson = JSON.parse(aiResponse.reply);
    parsed = AiGeneratedSimulationSchema.parse(rawJson);
  } catch (err: any) {
    console.error(`[Dynamic AI Simulation Generation Failed for ${normSkill}]:`, err.message);
    throw new Error(`Unable to generate your personalized assessment right now. ${err.message}`);
  }

  // 4. Structure the Simulation View Data
  const simulationData: SkillSimulation = {
    skill: normSkill,
    targetRole,
    difficulty,
    title: parsed.title,
    description: parsed.description,
    stages: {
      understand: {
        stage: "understand",
        title: "Conceptual Understanding",
        question: parsed.understand.question,
        options: parsed.understand.options,
      },
      debug: {
        stage: "debug",
        title: "Debug Challenge",
        question: parsed.debug.question,
        codeSnippet: parsed.debug.codeSnippet,
        options: parsed.debug.options,
      },
      code: {
        stage: "code",
        title: "Hands-on Implementation",
        question: parsed.code.question,
        starterCode: parsed.code.starterCode,
        instructions: parsed.code.instructions,
      },
      explain: {
        stage: "explain",
        title: "Technical Reasoning",
        question: parsed.explain.question,
        placeholder: parsed.explain.placeholder || `Explain your architectural reasoning for ${normSkill}...`,
      },
    },
  };

  // 5. Persist the generated simulation attempt and answer keys in ActivityLog (Zero schema change)
  await prisma.activityLog.create({
    data: {
      userId,
      type: "SKILL_SIMULATION_ACTIVE",
      description: `Generated dynamic ${difficulty} simulation for ${normSkill} (${targetRole})`,
      metadata: {
        skill: normSkill,
        targetRole,
        difficulty,
        simulationData,
        answerKeys: {
          understandCorrect: parsed.understand.correctAnswer,
          debugCorrect: parsed.debug.correctAnswer,
          codeRequiredPatterns: parsed.code.requiredPatterns,
          explainKeyConcepts: parsed.explain.keyConcepts,
        },
        generatedAt: new Date().toISOString(),
      } as any,
    },
  });

  return simulationData;
}

// ============================================================
// SUBMISSION EVALUATION & CANONICAL PERSISTENCE
// ============================================================

/**
 * Evaluates candidate submission against the dynamically generated answer keys,
 * updates canonical SkillState & SkillStateHistory, persists results in ActivityLog,
 * and awards XP once.
 */
export async function submitSkillSimulation(
  userId: string,
  skillName: string,
  answers: SimulationSubmissionAnswers
): Promise<SimulationResult> {
  const normSkill = skillName.trim();

  // 1. Locate the active simulation
  const activeLogs = await prisma.activityLog.findMany({
    where: {
      userId,
      type: "SKILL_SIMULATION_ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeLog = activeLogs.find((log) => {
    const meta = log.metadata as any;
    return meta?.skill && meta.skill.toLowerCase() === normSkill.toLowerCase();
  });

  // Duplicate submission protection: if no active log, check if already completed
  if (!activeLog || !activeLog.metadata) {
    const existingResult = await getLatestSkillSimulationResult(userId, normSkill);
    if (existingResult) {
      return existingResult;
    }
    throw new Error(`No active simulation found for skill ${normSkill}. Please start a new simulation.`);
  }

  const activeMeta = activeLog.metadata as any;
  const answerKeys = activeMeta.answerKeys || {};
  const targetRole = activeMeta.targetRole || "Software Engineer";
  const difficulty = activeMeta.difficulty || "intermediate";

  // 2. Authentic 4-Stage Scoring
  // Stage 1: Understand (25%)
  const understandAns = (answers.understandAnswer || "").trim().toLowerCase();
  const understandCorrect = (answerKeys.understandCorrect || "").trim().toLowerCase();
  const understandPassed =
    understandAns.length > 0 &&
    (understandAns === understandCorrect ||
      understandAns.includes(understandCorrect) ||
      understandCorrect.includes(understandAns));
  const understandScore = understandPassed ? 100 : 0;

  // Stage 2: Debug (25%)
  const debugAns = (answers.debugAnswer || "").trim().toLowerCase();
  const debugCorrect = (answerKeys.debugCorrect || "").trim().toLowerCase();
  let debugScore = 0;
  if (debugAns.length > 0) {
    if (debugAns === debugCorrect || debugAns.includes(debugCorrect) || debugCorrect.includes(debugAns)) {
      debugScore = 100;
    } else {
      const debugWords = debugCorrect.split(/\s+/).filter((w: string) => w.length > 3);
      const matched = debugWords.filter((w: string) => debugAns.includes(w));
      if (debugWords.length > 0 && matched.length / debugWords.length >= 0.4) {
        debugScore = 80;
      } else if (debugAns.length > 20) {
        debugScore = 50;
      }
    }
  }

  // Stage 3: Code (25%)
  const codeAns = (answers.codeAnswer || "").trim().toLowerCase();
  const requiredPatterns: string[] = answerKeys.codeRequiredPatterns || [];
  let codeScore = 0;
  if (codeAns.length > 15) {
    let matchedPatterns = 0;
    for (const pattern of requiredPatterns) {
      if (codeAns.includes(pattern.toLowerCase())) {
        matchedPatterns++;
      }
    }
    const ratio = requiredPatterns.length > 0 ? matchedPatterns / requiredPatterns.length : 1;
    codeScore = Math.round(ratio * 100);
  }

  // Stage 4: Explain (25%)
  const explainAns = (answers.explainAnswer || "").trim().toLowerCase();
  const keyConcepts: string[] = answerKeys.explainKeyConcepts || [];
  let explainScore = 0;
  if (explainAns.length > 20) {
    let matchedConcepts = 0;
    for (const concept of keyConcepts) {
      if (explainAns.includes(concept.toLowerCase())) {
        matchedConcepts++;
      }
    }
    const ratio = keyConcepts.length > 0 ? matchedConcepts / keyConcepts.length : 1;
    explainScore = Math.min(100, Math.round(50 + ratio * 50));
  }

  // 3. Calculate Overall Score
  const overallScore = Math.round(
    0.25 * understandScore +
    0.25 * debugScore +
    0.25 * codeScore +
    0.25 * explainScore
  );

  // 4. Compute Strong Areas and Areas for Improvement
  const strongAreas: string[] = [];
  const needsPractice: string[] = [];

  if (understandScore >= 80) strongAreas.push("Conceptual Principles");
  else needsPractice.push("Foundational Concepts");

  if (debugScore >= 80) strongAreas.push("Debugging & Root-Cause Analysis");
  else needsPractice.push("Code Inspection & Bug Isolation");

  if (codeScore >= 80) strongAreas.push("Hands-on Code Implementation");
  else needsPractice.push("Practical Pattern Implementation");

  if (explainScore >= 80) strongAreas.push("Technical Communication & Tradeoffs");
  else needsPractice.push("Technical Reasoning & Clear Articulation");

  let feedback = "";
  if (overallScore >= 80) {
    feedback = `Exceptional mastery demonstrated in ${normSkill} for ${targetRole}. You showed solid conceptual understanding, effective bug diagnosis, and clean technical reasoning.`;
  } else if (overallScore >= 60) {
    feedback = `Good functional proficiency in ${normSkill}. Focus on edge-case debugging and refining pattern implementation to reach senior-level mastery.`;
  } else {
    feedback = `Foundational understanding in progress. We recommend reviewing core milestones in your Learning Path and practicing pattern implementations.`;
  }

  // 5. Update Canonical SkillState in PostgreSQL
  const userSkillStates = await prisma.skillState.findMany({
    where: { userId },
  });
  const existingSkillState = userSkillStates.find((s) => isMatchingSkill(s.skillName, normSkill));

  const newKnowledge = existingSkillState
    ? Math.max(existingSkillState.knowledgeScore, overallScore)
    : overallScore;
  const newPractice = existingSkillState
    ? Math.max(existingSkillState.practiceScore, Math.round(overallScore * 0.9))
    : Math.round(overallScore * 0.9);

  const canonicalSkillName = existingSkillState ? existingSkillState.skillName : normSkill;

  if (existingSkillState) {
    await prisma.skillState.update({
      where: { id: existingSkillState.id },
      data: {
        knowledgeScore: newKnowledge,
        practiceScore: newPractice,
        lastReviewed: new Date(),
      },
    });
  } else {
    await prisma.skillState.create({
      data: {
        userId,
        skillName: normSkill,
        knowledgeScore: newKnowledge,
        practiceScore: newPractice,
        lastReviewed: new Date(),
      },
    });
  }

  // 6. Record SkillStateHistory
  await prisma.skillStateHistory.create({
    data: {
      userId,
      skillName: canonicalSkillName,
      knowledgeScore: newKnowledge,
      practiceScore: newPractice,
      projectScore: existingSkillState?.projectScore || 0,
      evidenceScore: existingSkillState?.evidenceScore || 0,
    },
  });

  const completedAt = new Date().toISOString();

  // 7. Persist Evaluation Result in ActivityLog
  await prisma.activityLog.create({
    data: {
      userId,
      type: "ASSESSMENT",
      description: `Completed Skill Simulation for ${normSkill} with score ${overallScore}%`,
      metadata: {
        assessmentType: "skill_simulation",
        skill: normSkill,
        targetRole,
        difficulty,
        score: overallScore,
        overallScore,
        stageBreakdown: {
          understand: understandScore,
          debug: debugScore,
          code: codeScore,
          explain: explainScore,
        },
        strongAreas,
        needsPractice,
        feedback,
        completedAt,
      },
    },
  });

  // 8. Clean up the active simulation log
  await prisma.activityLog.delete({
    where: { id: activeLog.id },
  }).catch(() => null);

  // 9. Award XP via gamification service (protect against duplicate)
  try {
    const { awardXp } = await import("../../gamification/services/gamification.service.js");
    await awardXp(
      userId,
      "ASSESSMENT_COMPLETION",
      `skill-simulation-${normSkill.toLowerCase()}`,
      50,
      `Completed ${normSkill} Skill Simulation`
    );
  } catch (err: any) {
    console.warn(`[Gamification XP award skipped]: ${err.message}`);
  }

  // 10. Trigger Notification
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "ASSESSMENT",
      title: "Assessment Completed",
      message: `Completed Skill Simulation for ${normSkill} with score ${overallScore}%.`,
      metadata: { skill: normSkill, score: overallScore },
    });
  } catch (err) {
    console.error("Failed to create skill simulation notification:", err);
  }

  return {
    skill: normSkill,
    targetRole,
    difficulty,
    overallScore,
    stageBreakdown: {
      understand: understandScore,
      debug: debugScore,
      code: codeScore,
      explain: explainScore,
    },
    strongAreas,
    needsPractice,
    feedback,
    completedAt,
  };
}

// ============================================================
/**
 * Robust skill matching helper that prevents empty string matches and false positives
 * while correctly matching canonical variations (e.g. 'Node.js' vs 'Node.js / Asynchronous Programming').
 */
export function isMatchingSkill(metaSkillRaw: unknown, targetSkillRaw: string): boolean {
  if (typeof metaSkillRaw !== "string" || !metaSkillRaw.trim() || !targetSkillRaw.trim()) {
    return false;
  }
  const a = metaSkillRaw.toLowerCase().trim();
  const b = targetSkillRaw.toLowerCase().trim();
  if (a === b) return true;

  // Distinct skills that should never match
  if ((a === "react" && b === "react native") || (b === "react" && a === "react native")) {
    return false;
  }

  // Normalized alphanumeric match (e.g. "nodejs" vs "node.js", "html5" vs "html")
  const aClean = a.replace(/[^a-z0-9]/g, "");
  const bClean = b.replace(/[^a-z0-9]/g, "");
  if (aClean && bClean && aClean === bClean) return true;

  // Canonical skill compounds
  if (a.startsWith("node.js") && (b === "node.js" || b === "node")) return true;
  if (b.startsWith("node.js") && (a === "node.js" || a === "node")) return true;
  if (a.startsWith("html") && (b === "html" || b === "html5")) return true;
  if (b.startsWith("html") && (a === "html" || a === "html5")) return true;
  if (a.startsWith("css") && (b === "css" || b === "css3")) return true;
  if (b.startsWith("css") && (a === "css" || a === "css3")) return true;

  // Substring / containment matching for skill names (e.g. "Architecture" vs "System Architecture", "AWS / Cloud" vs "AWS")
  if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) {
    return true;
  }

  // Compound skills separated by "/" or "," (e.g., "Node.js / Architecture" or "Docker, PostgreSQL")
  // Only match if a distinct component matches or contains the target skill
  const aParts = a.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
  const bParts = b.split(/[/,]/).map((p) => p.trim()).filter(Boolean);

  if (aParts.length > 1 || bParts.length > 1) {
    for (const pA of aParts) {
      for (const pB of bParts) {
        if (pA === pB) return true;
        const pAClean = pA.replace(/[^a-z0-9]/g, "");
        const pBClean = pB.replace(/[^a-z0-9]/g, "");
        if (pAClean && pBClean && pAClean === pBClean) return true;
        if (pA.length >= 3 && pB.length >= 3 && (pA.includes(pB) || pB.includes(pA))) return true;
      }
    }
  }

  return false;
}

// ============================================================
// RESULT RETRIEVAL
// ============================================================

/**
 * Retrieves the latest simulation result for a user and skill from ActivityLog.
 */
export async function getLatestSkillSimulationResult(
  userId: string,
  skillName: string
): Promise<SimulationResult | null> {
  if (!skillName || !skillName.trim()) return null;

  const assessmentLogs = await prisma.activityLog.findMany({
    where: {
      userId,
      type: "ASSESSMENT",
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const matchingLog = assessmentLogs.find((log) => {
    const meta = log.metadata as any;
    if (!meta || typeof meta !== "object") return false;
    const isSim = meta.assessmentType === "skill_simulation" || meta.overallScore !== undefined;
    return isSim && isMatchingSkill(meta.skill, skillName);
  });

  if (!matchingLog || !matchingLog.metadata) {
    return null;
  }

  const meta = matchingLog.metadata as any;

  return {
    skill: meta.skill || skillName,
    targetRole: meta.targetRole,
    difficulty: meta.difficulty,
    overallScore: typeof meta.overallScore === "number" ? meta.overallScore : 0,
    stageBreakdown: meta.stageBreakdown || {
      understand: 0,
      debug: 0,
      code: 0,
      explain: 0,
    },
    strongAreas: Array.isArray(meta.strongAreas) ? meta.strongAreas : [],
    needsPractice: Array.isArray(meta.needsPractice) ? meta.needsPractice : [],
    feedback: meta.feedback || "",
    completedAt: meta.completedAt || matchingLog.createdAt.toISOString(),
  };
}
