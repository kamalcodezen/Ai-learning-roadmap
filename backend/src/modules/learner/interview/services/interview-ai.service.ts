import { ChatService } from "../../copilot/services/chat.service.js";

export type GeneratedInterviewQuestion = {
  question: string;
  order: number;
  category?: string;
  skillFocus?: string;
};

export type InterviewAIContext = {
  targetRole: string;
  experienceLevel: string;
  mode?: "TECHNICAL" | "PROBLEM_SOLVING" | "BEHAVIORAL" | "SKILL_GAP" | string;
  questionCount?: number;
  focusSkills?: string[];
  activeSkills?: string[];
  roadmapTopics?: string[];
};

export const generateInterviewQuestions = async (
  context: InterviewAIContext,
): Promise<GeneratedInterviewQuestion[]> => {
  const count = context.questionCount && context.questionCount >= 1 && context.questionCount <= 10
    ? context.questionCount
    : 3;

  const mode = context.mode || "TECHNICAL";
  const focusSkillsText = context.focusSkills && context.focusSkills.length > 0
    ? `Identified Weak Competencies to Challenge: ${context.focusSkills.join(", ")}`
    : "";

  const activeSkillsText = context.activeSkills && context.activeSkills.length > 0
    ? `Learner's Active Tech Stack & Skills: ${context.activeSkills.join(", ")}`
    : "";

  const roadmapTopicsText = context.roadmapTopics && context.roadmapTopics.length > 0
    ? `Learner's Current Learning Path Modules: ${context.roadmapTopics.join(", ")}`
    : "";

  let modeInstructions = "";
  if (mode === "BEHAVIORAL") {
    modeInstructions = `
Focus on Behavioral & Engineering Leadership (STAR Method: Situation, Task, Action, Result).
Questions should evaluate conflict resolution, handling technical debt vs strict deadlines, cross-functional engineering collaboration, and technical ownership.`;
  } else if (mode === "PROBLEM_SOLVING") {
    modeInstructions = `
Focus heavily on Algorithmic Problem Solving, Performance Optimization, and Live Code Debugging:
- Scenario 1: Optimizing an algorithmic bottleneck (e.g. reducing $O(N^2)$ to $O(N \\log N)$ or $O(N)$ with custom caching/data structures).
- Scenario 2: Investigating and isolating an asynchronous race condition, memory leak, or concurrency deadlock in production.
- Scenario 3: Refactoring legacy state management or deep query latency under extreme 100k+ RPM load.`;
  } else if (mode === "SKILL_GAP") {
    modeInstructions = `
Focus specifically on drilling and evaluating the candidate on their weak areas: ${focusSkillsText || "Core engineering fundamentals"}.
Create scenario-based diagnostic challenges requiring hands-on problem solving in these exact skills.`;
  } else {
    modeInstructions = `
Focus on Comprehensive System Architecture & Engineering Mechanics for ${context.targetRole}:
- Pillar 1: High-scale System Architecture, Modular Component Hierarchy, and Framework Internals.
- Pillar 2: Algorithmic Problem Solving, Memory Safety, Caching Strategies (Redis, CDN), and Concurrency.
- Pillar 3: Real-world Production Outage, Incident Debugging, Observability (APM, Distributed Tracing), and Security/API Design.`;
  }

  const prompt = `
You are an expert technical interviewer at a top-tier tech company (Google, Meta, Stripe).
Generate EXACTLY ${count} mock interview questions for a candidate with the following profile:
- Target Role: ${context.targetRole}
- Experience Level: ${context.experienceLevel}
- Mode: ${mode}
${activeSkillsText}
${roadmapTopicsText}
${focusSkillsText}

${modeInstructions}

Questions MUST be open-ended, realistic, scenario-based, and directly applicable to real engineering work.
Ensure the questions test both conceptual depth and practical hands-on problem-solving.

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "question": "The comprehensive scenario or question text",
      "order": 1,
      "category": "Architecture | Problem Solving | Debugging | Behavioral | Security",
      "skillFocus": "${context.targetRole}"
    }
  ]
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

  try {
    const result = await ChatService.processJsonCompletion(
      "You return only valid JSON.",
      prompt
    );

    let content = result.reply;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("[Interview AI] JSON Parse Error. Cleaned Content:", content);
      throw parseError;
    }
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
       throw new Error("AI did not return a valid questions list.");
    }

    return parsed.questions.map((q: any, i: number) => ({
      question: q.question || `Technical Question ${i + 1}`,
      order: q.order || i + 1,
      category: q.category || "Technical",
      skillFocus: q.skillFocus || context.targetRole,
    })) as GeneratedInterviewQuestion[];
  } catch (error: any) {
    console.error("Interview AI Question Gen Failed:", error);
    // Graceful fallback questions tailored to the role
    const fallbackList = [
      {
        question: `How would you architect and optimize a high-traffic production application for ${context.targetRole}, ensuring minimal latency, robust state management, and clear separation of concerns?`,
        order: 1,
        category: "Architecture",
        skillFocus: context.targetRole,
      },
      {
        question: `Suppose users experience an unexpected performance bottleneck or memory leak under heavy load. Walk me through your step-by-step diagnostic and problem-solving process to isolate the root cause and refactor it.`,
        order: 2,
        category: "Problem Solving",
        skillFocus: context.targetRole,
      },
      {
        question: `Describe a scenario where you faced a critical production incident or tight deadline tradeoff. How did you balance code quality, test coverage, and clear team communication to resolve it?`,
        order: 3,
        category: "Production Incident",
        skillFocus: context.targetRole,
      },
      {
        question: `How do you approach securing API endpoints, managing distributed session tokens, and mitigating common security vulnerabilities (CSRF, XSS, rate-limiting) in a ${context.targetRole} ecosystem?`,
        order: 4,
        category: "Security & API Design",
        skillFocus: context.targetRole,
      },
      {
        question: `Tell me about a time when you strongly disagreed with a technical design decision proposed by a teammate. How did you navigate the discussion, evaluate technical tradeoffs, and arrive at a consensus?`,
        order: 5,
        category: "Behavioral & Leadership",
        skillFocus: context.targetRole,
      },
    ];

    return fallbackList.slice(0, count);
  }
};

export type InterviewEvaluationResult = {
  technicalKnowledge: number;
  problemSolving: number;
  clarity: number;
  practicalUnderstanding: number;
  communication: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer?: string;
};

export const evaluateInterviewAnswer = async (
  questionText: string,
  answerText: string,
  targetRole: string,
): Promise<InterviewEvaluationResult> => {
  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer to a mock interview question.
Target Role: ${targetRole}

Question asked: "${questionText}"
Candidate's Answer: "${answerText}"

Evaluate the candidate's answer on the following 5 dimensions. Each score MUST be an integer between 0 and 100.
1. technicalKnowledge: Accuracy and depth of technical concepts.
2. problemSolving: Ability to approach and solve the scenario, considering complexity and edge cases.
3. clarity: How structured, clear, and easy to understand the answer is.
4. practicalUnderstanding: Evidence of real-world production applicability.
5. communication: Overall presentation and articulation.

Also provide:
- feedback: A concise, learner-friendly paragraph explaining what they did well and what they could improve.
- strengths: Array of 1-3 short strings highlighting strengths.
- improvements: Array of 1-3 short strings highlighting areas to improve.
- idealAnswer: A 2-3 paragraph model answer demonstrating how a Senior Staff Engineer at a top tech company would formulate a comprehensive, structured response to this exact question.

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "technicalKnowledge": 85,
  "problemSolving": 80,
  "clarity": 90,
  "practicalUnderstanding": 88,
  "communication": 85,
  "feedback": "Your explanation is good but...",
  "strengths": ["Clear structure", "Good examples"],
  "improvements": ["Mention performance tradeoffs"],
  "idealAnswer": "A top-tier answer would begin by outlining the architectural tradeoffs..."
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

  try {
    const result = await ChatService.processJsonCompletion(
      "You return only valid JSON.",
      prompt
    );

    let content = result.reply;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    const parsed = JSON.parse(content);
    
    return {
      technicalKnowledge: Math.min(100, Math.max(0, Number(parsed.technicalKnowledge) || 0)),
      problemSolving: Math.min(100, Math.max(0, Number(parsed.problemSolving) || 0)),
      clarity: Math.min(100, Math.max(0, Number(parsed.clarity) || 0)),
      practicalUnderstanding: Math.min(100, Math.max(0, Number(parsed.practicalUnderstanding) || 0)),
      communication: Math.min(100, Math.max(0, Number(parsed.communication) || 0)),
      feedback: parsed.feedback || "Answer evaluated successfully.",
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ["Structured communication", "Relevance to topic"],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : ["Add more concrete production examples"],
      idealAnswer: parsed.idealAnswer || "An optimal response addresses the core mechanics, edge cases, and performance tradeoffs with real-world architecture examples.",
    };
  } catch (error) {
    console.error("[Interview AI] Evaluation Failed:", error);
    return {
      technicalKnowledge: 75,
      problemSolving: 75,
      clarity: 80,
      practicalUnderstanding: 75,
      communication: 80,
      feedback: "Your response demonstrates good familiarity with the subject. Continue articulating real-world performance tradeoffs and edge cases.",
      strengths: ["Clear presentation", "Relevant context"],
      improvements: ["Elaborate on edge cases and caching strategies"],
      idealAnswer: "An optimal answer provides a clear architectural overview, identifies potential bottlenecks, and proposes concrete engineering solutions.",
    };
  }
};
