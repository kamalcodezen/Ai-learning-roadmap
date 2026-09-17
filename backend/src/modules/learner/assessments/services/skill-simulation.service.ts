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

/**
 * Deterministic fallback simulation generator guaranteeing zero 500 errors
 * when AI providers are in cooldown, rate-limited, or offline.
 */
export function generateFallbackSimulation(
  skill: string,
  targetRole: string,
  difficulty: string
): z.infer<typeof AiGeneratedSimulationSchema> {
  const s = skill.toLowerCase();

  if (s.includes("react") || s.includes("frontend") || s.includes("vue") || s.includes("next")) {
    return {
      title: `${skill} Mastery Simulation (${targetRole})`,
      description: `Evaluate your practical ability at ${difficulty} level to understand component lifecycles, debug re-renders, implement state logic, and explain rendering tradeoffs in ${skill}.`,
      understand: {
        question: `When optimizing component performance in ${skill}, which pattern prevents unnecessary child re-renders caused by passing inline objects or callbacks?`,
        options: [
          "Memoizing values with useMemo and callbacks with useCallback",
          "Wrapping all child components unconditionally in React.Fragment",
          "Moving state to global window object to bypass component trees",
          "Converting functional components to class components with shouldComponentUpdate returning true"
        ],
        correctAnswer: "Memoizing values with useMemo and callbacks with useCallback",
      },
      debug: {
        question: `Identify the root cause of the bug in this ${skill} snippet:`,
        codeSnippet: `function UserList({ fetchUsers }) {\n  const [users, setUsers] = useState([]);\n  useEffect(() => {\n    fetchUsers().then(data => setUsers(data));\n  }, [fetchUsers]);\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}`,
        options: [
          "Infinite fetch loop if fetchUsers is recreated on every parent render without useCallback",
          "setUsers cannot accept a promise result directly inside useEffect",
          "The list key must be an index instead of u.id",
          "useEffect must be marked async directly: useEffect(async () => ...)"
        ],
        correctAnswer: "Infinite fetch loop if fetchUsers is recreated on every parent render without useCallback",
      },
      code: {
        question: `Implement an optimized data fetcher hook or helper for ${skill} with loading, error, and cancellation handling.`,
        starterCode: `import { useState, useEffect } from 'react';\n\nexport function useAsyncData(fetcher) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    let isMounted = true;\n    // TODO: Invoke fetcher, handle resolution and cleanup\n\n    return () => { isMounted = false; };\n  }, [fetcher]);\n\n  return { data, loading, error };\n}`,
        instructions: [
          "Call the fetcher inside useEffect and check isMounted before updating state",
          "Catch any rejected promise or error and update the error state",
          "Set loading to false once the operation completes or fails"
        ],
        requiredPatterns: ["isMounted", "setLoading", "catch"],
      },
      explain: {
        question: `Explain how ${skill} manages the reconciliation and virtual DOM diffing process, and describe two common rendering bottlenecks in production applications.`,
        placeholder: `Discuss the diffing algorithm, key prop significance, fiber architecture, and avoidance of waterfall re-renders...`,
        keyConcepts: ["reconciliation", "virtual dom", "re-rendering", "memoization", "props"],
      },
    };
  }

  if (s.includes("node") || s.includes("backend") || s.includes("api") || s.includes("express") || s.includes("nest")) {
    return {
      title: `${skill} Mastery Simulation (${targetRole})`,
      description: `Evaluate your practical ability at ${difficulty} level to design resilient services, handle asynchronous errors, implement scalable handlers, and explain event-loop mechanics in ${skill}.`,
      understand: {
        question: `In ${skill} asynchronous runtime, what happens if an unhandled promise rejection occurs during request handling?`,
        options: [
          "The process emits unhandledRejection which may terminate the Node process in modern versions if not caught",
          "The request automatically retries 3 times with exponential backoff",
          "The event loop blocks all other concurrent socket connections indefinitely",
          "V8 garbage collector immediately frees the memory of the rejected promise without logging"
        ],
        correctAnswer: "The process emits unhandledRejection which may terminate the Node process in modern versions if not caught",
      },
      debug: {
        question: `Identify the critical concurrency or resource issue in this ${skill} handler:`,
        codeSnippet: `app.get('/data', async (req, res) => {\n  const items = await db.getItems();\n  items.forEach(async (item) => {\n    await db.updateItemAudit(item.id);\n  });\n  res.json({ success: true, count: items.length });\n});`,
        options: [
          "forEach does not await async iterations; responses complete before audits finish, risking unhandled failures",
          "res.json cannot be called after database query execution",
          "db.getItems() must always accept a callback parameter in Node.js",
          "items.length cannot be accessed on an asynchronous array"
        ],
        correctAnswer: "forEach does not await async iterations; responses complete before audits finish, risking unhandled failures",
      },
      code: {
        question: `Implement a robust Express middleware or error-boundary handler in ${skill} with structured logging and HTTP status formatting.`,
        starterCode: `export function errorHandler(err, req, res, next) {\n  const statusCode = err.statusCode || 500;\n  // TODO: Log error details and return sanitized response\n  res.status(statusCode).json({\n    error: err.message || 'Internal Server Error'\n  });\n}`,
        instructions: [
          "Check err.statusCode or default to 500",
          "Log the error stack in development or structured logger",
          "Send a standardized JSON error response with status code"
        ],
        requiredPatterns: ["status", "json", "next"],
      },
      explain: {
        question: `Explain how the ${skill} Event Loop handles macrotasks vs microtasks (Promise jobs), and how to avoid blocking the event loop under heavy traffic.`,
        placeholder: `Discuss libuv, microtask queue priority, worker threads, and avoiding synchronous CPU-bound operations...`,
        keyConcepts: ["event loop", "microtasks", "libuv", "non-blocking", "concurrency"],
      },
    };
  }

  if (s.includes("sql") || s.includes("database") || s.includes("postgres") || s.includes("prisma") || s.includes("mongo")) {
    return {
      title: `${skill} Mastery Simulation (${targetRole})`,
      description: `Evaluate your database design, query optimization, indexing strategy, and transaction isolation skills in ${skill} at ${difficulty} level.`,
      understand: {
        question: `What is the primary architectural consequence of using the READ COMMITTED isolation level versus REPEATABLE READ in relational databases?`,
        options: [
          "READ COMMITTED prevents dirty reads but allows non-repeatable reads if another transaction updates data between queries",
          "READ COMMITTED completely prevents phantom reads across all concurrent transactions",
          "REPEATABLE READ disables all table locking and relies solely on optimistic memory hashing",
          "READ COMMITTED requires exclusive table locks for every SELECT statement"
        ],
        correctAnswer: "READ COMMITTED prevents dirty reads but allows non-repeatable reads if another transaction updates data between queries",
      },
      debug: {
        question: `Identify the performance bottleneck in this ${skill} query pattern:`,
        codeSnippet: `SELECT * FROM orders WHERE LOWER(customer_email) = 'user@example.com' ORDER BY created_at DESC;`,
        options: [
          "Applying LOWER() prevents the query planner from utilizing a standard B-tree index on customer_email",
          "ORDER BY created_at causes a syntax error when combined with LOWER()",
          "SELECT * is prohibited when indexing on text fields",
          "B-tree indexes cannot index emails containing '@' symbols"
        ],
        correctAnswer: "Applying LOWER() prevents the query planner from utilizing a standard B-tree index on customer_email",
      },
      code: {
        question: `Write a database transaction or parameterized query in ${skill} that updates an inventory balance safely against race conditions.`,
        starterCode: `async function transferCredits(senderId, receiverId, amount) {\n  // TODO: Implement atomic transaction ensuring no negative balance\n}`,
        instructions: [
          "Wrap balance validation and transfers in an atomic transaction",
          "Ensure sender has sufficient credits before decrementing",
          "Commit the transaction or roll back on failure"
        ],
        requiredPatterns: ["transaction", "commit", "rollback"],
      },
      explain: {
        question: `Explain indexing strategies (B-Tree, Hash, GIN) in ${skill}, and describe how indexing write-heavy tables impacts write latency and VACUUM maintenance.`,
        placeholder: `Discuss index overhead on INSERT/UPDATE, index bloat, execution plan analysis via EXPLAIN ANALYZE...`,
        keyConcepts: ["indexing", "b-tree", "explain analyze", "transactions", "acid"],
      },
    };
  }

  // Generic High-Quality Technical Skill Simulation for any other skill
  return {
    title: `${skill} Mastery Simulation (${targetRole})`,
    description: `Evaluate your practical ability at ${difficulty} level to understand, debug, code, and explain ${skill} in a professional ${targetRole} context.`,
    understand: {
      question: `What is the core architectural principle and recommended best practice when designing scalable solutions with ${skill}?`,
      options: [
        `Separation of concerns, modularity, and enforcing idempotent operations for ${skill}`,
        `Coupling all application layers directly into single global shared state`,
        `Ignoring error boundaries and relying entirely on process restarts`,
        `Bypassing typing and schema validations to maximize raw network throughput`
      ],
      correctAnswer: `Separation of concerns, modularity, and enforcing idempotent operations for ${skill}`,
    },
    debug: {
      question: `Review the following code or configuration for ${skill}. What is the primary bug or security flaw?`,
      codeSnippet: `// Configuration / Handler for ${skill}\nfunction processPayload(data) {\n  if (!data) return;\n  const result = eval(data.expression); // dynamic evaluation\n  return { success: true, result };\n}`,
      options: [
        "Unsanitized dynamic evaluation (eval) introduces arbitrary code execution vulnerabilities",
        `data.expression is a reserved keyword in ${skill}`,
        "The return statement cannot return object literals with boolean keys",
        `Functions in ${skill} must always declare parameters as constants`
      ],
      correctAnswer: "Unsanitized dynamic evaluation (eval) introduces arbitrary code execution vulnerabilities",
    },
    code: {
      question: `Implement a clean, reusable utility or service method for ${skill} adhering to clean architecture standards.`,
      starterCode: `// Implementation for ${skill}\nexport function executeTask(config) {\n  if (!config) throw new Error('Config required');\n  // TODO: Implement core execution logic with error handling\n  return { success: true };\n}`,
      instructions: [
        `Validate input configuration and handle boundary conditions for ${skill}`,
        "Ensure errors are caught and transformed into structured return types",
        "Return an object containing status and execution results"
      ],
      requiredPatterns: ["config", "return", "error"],
    },
    explain: {
      question: `Explain how ${skill} is strategically utilized in production architectures for a ${targetRole}. Detail key trade-offs, scaling considerations, and monitoring strategies.`,
      placeholder: `Discuss system reliability, throughput, trade-offs between complexity vs maintainability, and testing strategies for ${skill}...`,
      keyConcepts: ["architecture", "reliability", "scalability", "testing", "maintainability"],
    },
  };
}

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
    console.warn(`[Dynamic AI Simulation Generation Fallback used for ${normSkill}]:`, err.message);
    parsed = generateFallbackSimulation(normSkill, targetRole, difficulty);
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
        durationMinutes: 15,
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

  // Normalized CLI alias helper (CLI <-> Command Line Interface)
  const normA = a.replace(/command\s*line\s*interface/gi, "cli").replace(/command\s*line/gi, "cli");
  const normB = b.replace(/command\s*line\s*interface/gi, "cli").replace(/command\s*line/gi, "cli");

  // Normalized alphanumeric match (e.g. "nodejs" vs "node.js", "html5" vs "html")
  const aClean = normA.replace(/[^a-z0-9]/g, "");
  const bClean = normB.replace(/[^a-z0-9]/g, "");
  if (aClean && bClean && aClean === bClean) return true;

  // Canonical skill compounds
  if (normA.startsWith("node.js") && (normB === "node.js" || normB === "node")) return true;
  if (normB.startsWith("node.js") && (normA === "node.js" || normA === "node")) return true;
  if (normA.startsWith("html") && (normB === "html" || normB === "html5")) return true;
  if (normB.startsWith("html") && (normA === "html" || normA === "html5")) return true;
  if (normA.startsWith("css") && (normB === "css" || normB === "css3")) return true;
  if (normB.startsWith("css") && (normA === "css" || normA === "css3")) return true;

  // Substring / containment matching for skill names (e.g. "Architecture" vs "System Architecture", "AWS / Cloud" vs "AWS")
  if (normA.length >= 3 && normB.length >= 3 && (normA.includes(normB) || normB.includes(normA))) {
    return true;
  }

  // Compound skills separated by "/", ",", "–", "—", "-", "|", "(", ")", or " or "
  const splitRegex = /[/,–—|()]|\s+or\s+/;
  const aParts = normA.split(splitRegex).map((p) => p.trim()).filter(Boolean);
  const bParts = normB.split(splitRegex).map((p) => p.trim()).filter(Boolean);

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
