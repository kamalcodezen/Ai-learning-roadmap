import { z } from "zod";
import { ChatService } from "../../copilot/services/chat.service.js";

// ============================================================
// TYPES
// ============================================================

export type GeneratedDiagnosticQuestion = {
  question: string;
  description: string;
  category: string;
  skill: string;
  options: string[];
  correctAnswer: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  explanation: string;
};

export type DiagnosticAIContext = {
  targetRole: string;
  experienceLevel: string;
  weeklyAvailableHours?: number;
  knownSkills?: string[];
  skillGaps?: string[];
  weakAreas?: string;
};

// ============================================================
// STRICT ZOD SCHEMAS FOR AI VALIDATION
// ============================================================

const DifficultyEnum = z
  .string()
  .transform((d) => d.toLowerCase().trim())
  .pipe(z.enum(["beginner", "intermediate", "advanced"]))
  .catch("intermediate");

const resolveAnswer = (options: string[], answer: string): string => {
  const normAns = answer.trim().toLowerCase();

  // 1. Direct or trimmed case-insensitive match
  const direct = options.find((opt) => opt.trim().toLowerCase() === normAns);
  if (direct) return direct;

  // 2. Letter index A/B/C/D, 1/2/3/4, Option A, etc.
  const letterMap: Record<string, number> = {
    a: 0, b: 1, c: 2, d: 3,
    "1": 0, "2": 1, "3": 2, "4": 3,
    "0": 0,
    "option a": 0, "option b": 1, "option c": 2, "option d": 3,
    "option 1": 0, "option 2": 1, "option 3": 2, "option 4": 3,
  };
  const idx = letterMap[normAns];
  if (typeof idx === "number") {
    const opt = options[idx];
    if (opt !== undefined) return opt;
  }

  // 3. Prefix match: "A) text" or "A. text"
  const prefixMatch = normAns.match(/^([a-d1-4])[\s.)\]:-]+(.*)$/i);
  if (prefixMatch && prefixMatch[1]) {
    const key = prefixMatch[1].toLowerCase();
    const prefixIdx = letterMap[key];
    if (typeof prefixIdx === "number") {
      const opt = options[prefixIdx];
      if (opt !== undefined) return opt;
    }
  }

  // 4. Substring match
  const sub = options.find(
    (opt) => opt.toLowerCase().includes(normAns) || normAns.includes(opt.toLowerCase())
  );
  if (sub) return sub;

  // Fallback to first option safely
  return options[0] || answer;
};

const TechnicalQuestionSchema = z
  .object({
    question: z.string().trim().min(8, "Question text is too short"),
    description: z.string().trim().optional().default(""),
    category: z.string().trim().min(2, "Category is required"),
    skill: z.string().trim().min(2, "Skill is required"),
    options: z
      .array(z.string().trim().min(1, "Option cannot be empty"))
      .length(4, "Must have exactly 4 options"),
    correctAnswer: z.string().trim().min(1, "Correct answer is required"),
    difficulty: DifficultyEnum,
    explanation: z.string().trim().optional().default(""),
  })
  .transform((data) => {
    return {
      ...data,
      correctAnswer: resolveAnswer(data.options, data.correctAnswer),
    };
  });

const CommunicationQuestionSchema = z.object({
  question: z.string().trim().min(10, "Communication question is too short"),
  description: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default("Communication"),
  skill: z.string().trim().min(2).default("Technical Communication"),
  difficulty: DifficultyEnum.default("intermediate"),
  explanation: z.string().trim().optional().default(""),
});

export const DiagnosticAiResponseSchema = z.object({
  technicalQuestions: z
    .array(TechnicalQuestionSchema)
    .length(5, "Must contain exactly 5 technical MCQ questions"),
  communicationQuestion: CommunicationQuestionSchema,
});

// Secondary fallback schemas
const FallbackMcqResponseSchema = z.object({
  questions: z.array(TechnicalQuestionSchema).length(5),
});

const FallbackCommResponseSchema = z.object({
  questions: z.array(CommunicationQuestionSchema).length(1),
});

// ============================================================
// FAST AI GENERATION SERVICE (SKILL SIMULATION ARCHITECTURE)
// ============================================================

/**
 * Generates all 6 diagnostic questions (5 MCQs + 1 Communication question)
 * in a SINGLE structured AI call with Zod validation.
 * Falls back to 2 parallel calls if the unified schema fails.
 */
export const generateDiagnosticQuestions = async (
  context: DiagnosticAIContext,
): Promise<GeneratedDiagnosticQuestion[]> => {
  const targetRole = context.targetRole?.trim() || "Full Stack Developer";
  const experienceLevel = context.experienceLevel?.trim() || "Intermediate";
  const knownSkills =
    context.knownSkills && context.knownSkills.length > 0
      ? context.knownSkills.join(", ")
      : "Baseline competencies";
  const focusAreas =
    context.weakAreas?.trim() ||
    (context.skillGaps && context.skillGaps.length > 0
      ? context.skillGaps.join(", ")
      : "Core role principles, architecture, and practical execution");

  // ============================================================
  // PRIMARY PATH: ONE UNIFIED AI REQUEST (5 MCQs + 1 Comm)
  // ============================================================
  const unifiedSystemInstruction = `You are a Principal Technical Assessor and Career Mentor designing a tailored 6-part diagnostic baseline assessment for a candidate.

Context:
- Target Career Role: "${targetRole}"
- Candidate Level: "${experienceLevel}"
- Known Skills: "${knownSkills}"
- Target Focus / Gap Areas: "${focusAreas}"

CRITICAL RULES:
1. Generate EXACTLY 5 multiple-choice questions ("technicalQuestions") and EXACTLY 1 open-ended communication question ("communicationQuestion").
2. The 5 technical questions MUST progressively evaluate:
   Q1: Core Fundamentals
   Q2: Conceptual Understanding & Architecture
   Q3: Practical Implementation & Syntax
   Q4: Problem Solving & Debugging
   Q5: Role-Specific Real-World Reasoning
3. Each technical question MUST have exactly 4 distinct options. The "correctAnswer" MUST match one option string exactly.
4. The communication question MUST challenge the candidate to articulate a technical architecture, trade-off, or design concept clearly in their own words.
5. Calibrate question difficulty to "${experienceLevel.toLowerCase()}".
6. Return ONLY valid JSON matching this exact structure:
{
  "technicalQuestions": [
    {
      "question": "Scenario or technical challenge",
      "description": "Optional context or code snippet",
      "category": "e.g., Frontend, Backend, Database, Cloud",
      "skill": "e.g., React, Node.js, SQL, System Design",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact string from options",
      "difficulty": "intermediate",
      "explanation": "Why this answer is correct"
    }
  ],
  "communicationQuestion": {
    "question": "Open-ended explanation challenge",
    "description": "Context for the communication scenario",
    "category": "Communication",
    "skill": "Technical Communication",
    "difficulty": "intermediate",
    "explanation": "What an exemplary answer should cover"
  }
}`;

  const unifiedUserPrompt = `Generate a rigorous, authentic 6-question diagnostic assessment for a candidate targeting "${targetRole}" at "${experienceLevel}" level. Return only valid JSON.`;

  try {
    const aiResponse = await ChatService.processJsonCompletion(
      unifiedSystemInstruction,
      unifiedUserPrompt,
    );

    let rawReply = aiResponse.reply.trim();
    const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
    if (jsonMatch) rawReply = jsonMatch[0];

    const rawJson = JSON.parse(rawReply);
    const parsed = DiagnosticAiResponseSchema.parse(rawJson);

    console.log(
      `[Diagnostic AI] Fast Unified Generation succeeded via ${aiResponse.provider} (${aiResponse.model})`,
    );

    const technicalMapped: GeneratedDiagnosticQuestion[] = parsed.technicalQuestions.map(
      (q) => ({
        question: q.question,
        description: q.description || "",
        category: q.category,
        skill: q.skill,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation || "",
      }),
    );

    const commMapped: GeneratedDiagnosticQuestion = {
      question: parsed.communicationQuestion.question,
      description: parsed.communicationQuestion.description || "",
      category: "Communication",
      skill: parsed.communicationQuestion.skill || "Technical Communication",
      options: [],
      correctAnswer: "",
      difficulty: parsed.communicationQuestion.difficulty,
      explanation: parsed.communicationQuestion.explanation || "",
    };

    return [...technicalMapped, commMapped];
  } catch (primaryErr: any) {
    console.warn(
      `[Diagnostic AI] Unified generation failed (${primaryErr.message}). Falling back to parallel 2-call generation...`,
    );

    // ============================================================
    // SECONDARY FALLBACK: 2 PARALLEL AI REQUESTS
    // ============================================================
    const mcqPrompt = `You are an expert technical interviewer. Generate EXACTLY 5 diagnostic multiple-choice questions for:
Role: ${targetRole}, Level: ${experienceLevel}, Focus: ${focusAreas}.
Progressively test Fundamentals, Conceptual, Practical, Problem Solving, Role-specific reasoning.
Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "...",
      "description": "...",
      "category": "...",
      "skill": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "difficulty": "intermediate",
      "explanation": "..."
    }
  ]
}`;

    const commPrompt = `You are an expert technical interviewer. Generate EXACTLY 1 open-ended technical communication question for:
Role: ${targetRole}, Level: ${experienceLevel}.
Ask candidate to explain a core system or architectural concept in their own words.
Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "...",
      "description": "...",
      "category": "Communication",
      "skill": "Technical Communication",
      "difficulty": "intermediate",
      "explanation": "..."
    }
  ]
}`;

    try {
      const [mcqResult, commResult] = await Promise.all([
        ChatService.processJsonCompletion("You return only valid JSON.", mcqPrompt),
        ChatService.processJsonCompletion("You return only valid JSON.", commPrompt),
      ]);

      const parseJsonSafe = (reply: string) => {
        let text = reply.trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) text = match[0];
        return JSON.parse(text);
      };

      const parsedMcqs = FallbackMcqResponseSchema.parse(parseJsonSafe(mcqResult.reply));
      const parsedComm = FallbackCommResponseSchema.parse(parseJsonSafe(commResult.reply));

      const technicalMapped: GeneratedDiagnosticQuestion[] = parsedMcqs.questions.map(
        (q) => ({
          question: q.question,
          description: q.description || "",
          category: q.category,
          skill: q.skill,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          explanation: q.explanation || "",
        }),
      );

      const firstComm = parsedComm.questions[0];
      if (!firstComm) {
        throw new Error("Missing communication question in fallback response");
      }

      const commMapped: GeneratedDiagnosticQuestion = {
        question: firstComm.question,
        description: firstComm.description || "",
        category: "Communication",
        skill: firstComm.skill || "Technical Communication",
        options: [],
        correctAnswer: "",
        difficulty: firstComm.difficulty,
        explanation: firstComm.explanation || "",
      };

      return [...technicalMapped, commMapped];
    } catch (fallbackErr: any) {
      console.warn(
        `[Diagnostic AI Fallback Generation Failed, activating curated role diagnostic]:`,
        fallbackErr.message,
      );
      return getCuratedRoleDiagnostic(targetRole);
    }
  }
};

export const getCuratedRoleDiagnostic = (targetRole: string): GeneratedDiagnosticQuestion[] => {
  const roleNorm = (targetRole || "").toLowerCase();
  const isFrontend = roleNorm.includes("front") || roleNorm.includes("react") || roleNorm.includes("ui");

  if (isFrontend) {
    return [
      {
        question: "What is the primary difference between state and props in React?",
        description: "Core frontend architecture and data flow.",
        category: "Frontend Architecture",
        skill: "React",
        options: [
          "State is internal and mutable by the component; props are external and read-only.",
          "Props are internal and mutable; state is external and read-only.",
          "State can only be passed from parent to child; props cannot.",
          "Props trigger re-renders; state changes do not.",
        ],
        correctAnswer: "State is internal and mutable by the component; props are external and read-only.",
        difficulty: "beginner",
        explanation: "State holds private component data, whereas props are immutable inputs passed by parent components.",
      },
      {
        question: "Which hook should be used in React for memoizing expensive calculations?",
        description: "Performance optimization in modern client frameworks.",
        category: "Performance Optimization",
        skill: "React",
        options: ["useMemo", "useCallback", "useEffect", "useRef"],
        correctAnswer: "useMemo",
        difficulty: "intermediate",
        explanation: "useMemo caches the result of a function call until dependencies change.",
      },
      {
        question: "How does TypeScript enforce type safety during runtime in a Node.js application?",
        description: "Static analysis vs runtime guarantees.",
        category: "Type Systems",
        skill: "TypeScript",
        options: [
          "It does not enforce types at runtime; TypeScript types are erased during compilation.",
          "It throws type assertion errors automatically at runtime.",
          "It validates object shapes via hidden proxy wrappers.",
          "It converts type definitions into native V8 schema checks.",
        ],
        correctAnswer: "It does not enforce types at runtime; TypeScript types are erased during compilation.",
        difficulty: "intermediate",
        explanation: "TypeScript is purely a compile-time static type checker; types are completely erased in emitted JavaScript.",
      },
      {
        question: "A user reports slow initial page rendering on a web app. Which strategy best resolves large JS bundle overhead?",
        description: "Practical troubleshooting and web vitals optimization.",
        category: "Problem Solving",
        skill: "Web Performance",
        options: [
          "Implement route-based dynamic imports (code splitting) and lazy loading.",
          "Inline all CSS stylesheets directly into the head element.",
          "Convert all client-side images into base64 data URIs.",
          "Disable browser caching headers across the application.",
        ],
        correctAnswer: "Implement route-based dynamic imports (code splitting) and lazy loading.",
        difficulty: "intermediate",
        explanation: "Code splitting splits the bundle into smaller chunks that load on demand, dramatically reducing First Contentful Paint.",
      },
      {
        question: "In CSS Flexbox, what does the property `align-items: center` control?",
        description: "Responsive layouts and modern styling.",
        category: "Styling & Layout",
        skill: "CSS",
        options: [
          "Alignment of flex items along the cross axis.",
          "Alignment of flex items along the main axis.",
          "Distribution of extra space between lines of wrapped items.",
          "The direction in which flex items are placed.",
        ],
        correctAnswer: "Alignment of flex items along the cross axis.",
        difficulty: "beginner",
        explanation: "align-items aligns items along the cross axis, whereas justify-content aligns along the main axis.",
      },
      {
        question: "Explain the concept of client-side caching (e.g., React Query or SWR) and how stale-while-revalidate improves user experience.",
        description: "Technical communication and architectural reasoning.",
        category: "Communication",
        skill: "Technical Communication",
        options: [],
        correctAnswer: "",
        difficulty: "intermediate",
        explanation: "Candidate should explain caching immediately renders stale cached data while asynchronously fetching fresh data in the background.",
      },
    ];
  }

  // Default: Full-Stack / Software Engineer
  return [
    {
      question: "What is the primary role of the Event Loop in JavaScript (V8 runtime)?",
      description: "Asynchronous runtime behavior and concurrency.",
      category: "JavaScript Fundamentals",
      skill: "JavaScript",
      options: [
        "It monitors the Call Stack and moves callbacks from the Task Queue when the stack is empty.",
        "It compiles JavaScript source code into machine code using JIT compilation.",
        "It creates multiple operating system threads to execute functions simultaneously.",
        "It allocates and frees heap memory for object instances.",
      ],
      correctAnswer: "It monitors the Call Stack and moves callbacks from the Task Queue when the stack is empty.",
      difficulty: "beginner",
      explanation: "The event loop continuously checks if the call stack is empty, dequeuing callbacks from microtask and macrotask queues.",
    },
    {
      question: "Which database index structure is most commonly used for standard B-Tree equality and range queries in relational databases?",
      description: "Database architecture and query performance.",
      category: "Data Architecture",
      skill: "SQL",
      options: ["B+ Tree index", "Hash index", "Inverted index", "Bitmap index"],
      correctAnswer: "B+ Tree index",
      difficulty: "intermediate",
      explanation: "B+ Trees maintain sorted keys with linked leaf nodes, making both point lookups and range scans efficient (O(log N)).",
    },
    {
      question: "When designing a RESTful API, which HTTP status code and verb combination best represents successfully creating a new resource?",
      description: "API design conventions and client-server standards.",
      category: "API Design",
      skill: "REST APIs",
      options: [
        "POST with 201 Created",
        "PUT with 200 OK",
        "GET with 201 Created",
        "PATCH with 204 No Content",
      ],
      correctAnswer: "POST with 201 Created",
      difficulty: "beginner",
      explanation: "POST is standard for resource creation, and 201 Created indicates the resource was successfully created.",
    },
    {
      question: "A production API endpoint's response time suddenly spikes from 50ms to 2500ms during peak load. Which diagnostic step should you take first?",
      description: "Production triage and systematic problem solving.",
      category: "Problem Solving",
      skill: "System Design",
      options: [
        "Inspect database slow-query logs and connection pool saturation metrics.",
        "Immediately restart all application servers to clear RAM.",
        "Delete old database rows to free storage space.",
        "Disable SSL/TLS certificate verification on incoming requests.",
      ],
      correctAnswer: "Inspect database slow-query logs and connection pool saturation metrics.",
      difficulty: "intermediate",
      explanation: "Under load, database connection pool exhaustion and unindexed queries are the primary culprits for latency spikes.",
    },
    {
      question: "What is the key advantage of using connection pooling in backend services interacting with PostgreSQL?",
      description: "Backend architecture and resource efficiency.",
      category: "Backend Architecture",
      skill: "Node.js",
      options: [
        "It reuses established database connections instead of incurring the TLS and process fork handshake overhead per request.",
        "It bypasses database authentication and authorization policies.",
        "It compresses all SQL statements into binary protobuf messages.",
        "It replaces ACID transactions with asynchronous event streams.",
      ],
      correctAnswer: "It reuses established database connections instead of incurring the TLS and process fork handshake overhead per request.",
      difficulty: "intermediate",
      explanation: "PostgreSQL forks a process per connection; pooling prevents high latency and thread exhaustion during concurrent requests.",
    },
    {
      question: "Explain the architectural trade-offs between monolithic and microservices architectures, and when you would choose one over the other.",
      description: "Technical communication and architectural reasoning.",
      category: "Communication",
      skill: "Technical Communication",
      options: [],
      correctAnswer: "",
      difficulty: "intermediate",
      explanation: "Candidate should discuss operational complexity, network latency, deployment independence, and organizational scaling.",
    },
  ];
};
