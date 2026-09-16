import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";

import env from "../../../../config/env.js";
import {
  buildChatPrompt,
  detectQueryComplexity,
  type QueryComplexity,
} from "../chat.prompts.js";

export interface MessageItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  reply: string;
  provider: string;
  model: string;
  complexity: QueryComplexity;
}

const groq = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;
const groqSecondary = env.GROQ_API_KEY_SECONDARY
  ? new Groq({ apiKey: env.GROQ_API_KEY_SECONDARY })
  : null;
const gemini = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;
const mistral = env.MISTRAL_API_KEY
  ? new Mistral({ apiKey: env.MISTRAL_API_KEY })
  : null;

// Models
// এই ৪টি কিন্তু ৪টি আলাদা API Key নয়!
// এগুলো সবই Groq-এর ভেতরের ৪টি আলাদা মডেল, যা একটিমাত্র GROQ_API_KEY দিয়েই চলে:
const GROQ_SIMPLE_MODEL = "openai/gpt-oss-120b";
const GROQ_COMPLEX_MODEL = "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = "qwen/qwen3.8-27b";
const GROQ_TERTIARY_MODEL = "openai/gpt-oss-20b";

// এটি OpenRouter-এর মডেল ➔ OPENROUTER_API_KEY ও OPENROUTER_API_KEY_SECONDARY দিয়ে চলে
const OPENROUTER_MODEL = "qwen/qwen-2.5-coder-32b-instruct";
const OPENROUTER_FALLBACK_MODEL = "qwen/qwen-2.5-72b-instruct";
const OPENROUTER_TERTIARY_MODEL = "meta-llama/llama-3.1-8b-instruct";

// এটি Google-এর মডেল ➔ GEMINI_API_KEY দিয়ে চলে
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_FALLBACK_MODEL = "gemini-2.0-flash";

// এটি Mistral-এর মডেল ➔ MISTRAL_API_KEY দিয়ে চলে
const MISTRAL_MODEL = "mistral-small-latest";
const MISTRAL_FALLBACK_MODEL = "open-mistral-7b";


const OUTPUT_LIMITS: Record<QueryComplexity, number> = {
  simple: 1200,
  normal: 1800,
  complex: 2200,
};

export function ensureCleanResponseCompletion(text: string): string {
  if (!text || typeof text !== "string") return text;
  let trimmed = text.trim();

  // If already ends cleanly with valid punctuation or closing markdown
  const validPunctuation = [".", "!", "?", "```", "---", "*", '"', "'", "`", ")", "}", "]", ":"];
  const endsCleanly = validPunctuation.some((p) => trimmed.endsWith(p));

  if (!endsCleanly) {
    // Cut back trailing truncated fragment to the last complete sentence
    const lastPunctuationIndex = Math.max(
      trimmed.lastIndexOf(". "),
      trimmed.lastIndexOf(".\n"),
      trimmed.lastIndexOf("! "),
      trimmed.lastIndexOf("!\n"),
      trimmed.lastIndexOf("? "),
      trimmed.lastIndexOf("?\n"),
      trimmed.lastIndexOf("\n\n")
    );

    if (lastPunctuationIndex > trimmed.length * 0.4) {
      trimmed = trimmed.slice(0, lastPunctuationIndex + 1).trim();
    }
  }

  // Ensure there is always a clean closing call-to-action
  if (
    !trimmed.includes("👉 **Next Step:**") &&
    !trimmed.includes("👉 **Explore Deeper:**") &&
    !trimmed.includes("**Next**") &&
    !trimmed.includes("Next Step") &&
    !trimmed.includes("Explore Deeper")
  ) {
    trimmed += "\n\n---\n👉 **Next Step:**\nReply **\"Next\"** to proceed to the next step, or ask any question to dive deeper!";
  }

  return trimmed;
}

const PROVIDER_TIMEOUT_MS = 12000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = PROVIDER_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const queryOpenRouter = async (
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens: number,
  jsonMode = false,
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<string | null> => {
  try {
    const body: any = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature: jsonMode ? 0.1 : 0.2,
    };
    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      timeoutMs,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err: any) {
    console.warn(`[OpenRouter ${model} failed]: ${err.message}`);
    return null;
  }
};

const getRecentHistory = (history: any[] = []): MessageItem[] => {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim(),
    )
    .slice(-4)
    .map((item) => ({
      role: item.role as "user" | "assistant",
      content: item.content.trim(),
    }));
};

/**
 * Sanitizes and extracts clean, parseable JSON text from raw AI model outputs,
 * stripping markdown fences (```json ... ```) or conversational prefix/suffix text.
 */
export const extractValidJsonString = (raw: string): string => {
  if (!raw || typeof raw !== "string") return "";
  let cleaned = raw.trim();

  // Strip leading and trailing markdown code block wrappers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  } else if (cleaned.includes("```")) {
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      cleaned = fenceMatch[1].trim();
    }
  }

  // Find outermost JSON structure (object or array)
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }

  cleaned = cleaned.trim();

  // Test if valid JSON as-is
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Attempt repair: strip trailing commas before closing braces/brackets and remove line comments
    const repaired = cleaned
      .replace(/\/\/.*$/gm, "")
      .replace(/,\s*([}\]])/g, "$1")
      .trim();
    try {
      JSON.parse(repaired);
      return repaired;
    } catch {
      return repaired || cleaned;
    }
  }
};

import prisma from "../../../../lib/prisma.js";

export class ChatService {
  /**
   * Two-layer context strategy:
   * Layer A (ALWAYS): Lightweight baseline — target role + experience level (1 cheap DB query)
   * Layer B (CONDITIONAL): Full career context — skills, roadmap, projects (4 parallel queries)
   *   → Only triggered when message contains career/learning keywords
   *
   * This ensures the AI ALWAYS knows who the learner is and what role they are targeting,
   * even for general questions like "Is React important?" or "Tell me about Docker."
   */
  static async fetchUserContext(userId: string, message: string): Promise<string | undefined> {
    try {
      // Layer A: Always fetch the lightweight baseline profile (single cheap query)
      const profile = await prisma.careerProfile.findUnique({ where: { userId } });

      if (!profile) {
        return "USER CONTEXT:\nNo onboarding data found. The user has not set up a career profile yet. Politely suggest they complete onboarding at /onboarding to get a personalized experience.";
      }

      const roleName = profile.targetRoleName || profile.targetRole || "Unknown Role";
      const experience = profile.experienceLevel || "Unknown Experience";

      // Layer B: Check if the message warrants full career context (skills, roadmap, projects)
      const normalized = message.toLowerCase();
      const needsDeepContext = [
        "learn", "roadmap", "progress", "skill", "gap", "career", "role",
        "project", "assessment", "study", "plan", "framework", "tech", "stack",
        "build", "next", "milestone", "guidance", "status", "debt", "readiness",
        "ready", "interview", "resume", "job", "evidence", "proof", "diagnostic",
        "shikhbo", "shikhte", "kivabe", "ki vabe", "bujhiye", "korbo",
      ].some((kw) => normalized.includes(kw));

      // Baseline context (always included — very low token cost)
      let contextStr = `USER CONTEXT:\n\nTarget Role: ${roleName}\nExperience Level: ${experience}\n`;

      if (profile.resumeScore !== null && profile.resumeScore !== undefined) {
        contextStr += `Resume Score: ${Math.round(profile.resumeScore)}%\n`;
      }
      if (profile.interviewScore !== null && profile.interviewScore !== undefined) {
        contextStr += `Interview Score: ${Math.round(profile.interviewScore)}%\n`;
      }

      // If no deep context needed, return just the lightweight baseline
      if (!needsDeepContext) {
        return contextStr;
      }

      // Layer B: Full career context (parallel queries for performance)
      const [roadmap, allSkillStates, projects] = await Promise.all([
        prisma.roadmap.findFirst({
          where: { userId, status: "ACTIVE" },
          include: { milestones: { orderBy: { order: "asc" } } },
        }),
        prisma.skillState.findMany({
          where: { userId },
        }),
        prisma.project.findMany({
          where: { userId },
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            title: true,
            techStack: true,
            isVerified: true,
            score: true,
          },
        }),
      ]);

      // Skills categorization
      contextStr += `\nSKILL MASTERY & GAPS:\n`;
      if (allSkillStates.length > 0) {
        const strongSkills = allSkillStates.filter(
          (s) => (s.knowledgeScore + s.practiceScore + s.projectScore) / 3 >= 70,
        );
        const gapSkills = allSkillStates.filter(
          (s) => (s.knowledgeScore + s.practiceScore + s.projectScore) / 3 < 70,
        );

        if (strongSkills.length > 0) {
          contextStr += `Strengths:\n` + strongSkills.map((s) => `- ${s.skillName} (Score: ${Math.round(s.knowledgeScore)}%)`).join("\n") + "\n";
        }
        if (gapSkills.length > 0) {
          contextStr += `Active Skill Gaps:\n` + gapSkills.map((s) => `- ${s.skillName} (Score: ${Math.round(s.knowledgeScore)}%)`).join("\n") + "\n";
        }
      } else {
        contextStr += "No skills assessed yet. Suggest completing the Diagnostic at /diagnostic.\n";
      }

      // Roadmap context
      contextStr += `\nACTIVE ROADMAP:\n`;
      if (roadmap && roadmap.milestones.length > 0) {
        contextStr += `${roadmap.targetRole} Roadmap (Status: ${roadmap.status})\n`;

        const currentMilestone =
          roadmap.milestones.find((m) => m.status === "CURRENT") ||
          roadmap.milestones.find((m) => m.status === "UPCOMING") ||
          roadmap.milestones[0];

        if (currentMilestone) {
          contextStr += `Current Milestone: ${currentMilestone.title}\n`;
          if (currentMilestone.description)
            contextStr += `Description: ${currentMilestone.description}\n`;
          if (currentMilestone.why)
            contextStr += `Strategic Why: ${currentMilestone.why}\n`;
          if (currentMilestone.estimatedTime)
            contextStr += `Estimated Time: ${currentMilestone.estimatedTime}\n`;
          if (currentMilestone.unlocks && currentMilestone.unlocks.length > 0)
            contextStr += `Unlocks: ${currentMilestone.unlocks.join(", ")}\n`;
        } else {
          contextStr += `Current Milestone: None\n`;
        }

        const completedMilestones = roadmap.milestones.filter(
          (m) => m.status === "COMPLETED",
        );
        if (completedMilestones.length > 0) {
          contextStr += `Completed: ` + completedMilestones.map((m) => m.title).join(", ") + "\n";
        }
      } else {
        contextStr += `No active roadmap. Suggest visiting My Roadmap at /dashboard/learner/learning-path.\n`;
      }

      // Projects context
      if (projects.length > 0) {
        contextStr += `\nRECENT PROJECTS:\n`;
        contextStr += projects
          .map(
            (p) =>
              `- ${p.title} (${p.techStack.join(", ") || "No stack"}) - ${p.isVerified ? "Verified (" + Math.round(p.score) + "%)" : "In Progress"}`,
          )
          .join("\n");
      }

      return contextStr;
    } catch (error) {
      console.error("Error fetching user context for chat:", error);
      return undefined;
    }
  }


  private static async logAiUsage(provider: string, model: string, feature: string, status: string, durationMs: number = 0, tokensUsed: number = 0, errorMessage?: string) {
    try {
      await prisma.aiUsageLog.create({
        data: {
          provider,
          model,
          feature,
          status,
          durationMs,
          tokensUsed,
          errorMessage: errorMessage || null,
        }
      });
    } catch (e) {
      console.error("Failed to write AI usage log", e);
    }
  }

  static async processChat(
    message: string,
    history: MessageItem[] = [],
    context?: string,
  ): Promise<ChatResult> {
    const cleanMessage = typeof message === "string" ? message.trim() : "";
    if (!cleanMessage) throw new Error("Message cannot be empty.");

    const complexity = detectQueryComplexity(cleanMessage);
    const maxTokens = OUTPUT_LIMITS[complexity];
    const recentHistory = getRecentHistory(history);
    const systemPrompt = buildChatPrompt(context);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...recentHistory.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: "user" as const, content: cleanMessage },
    ];

    let reply = "";
    let provider = "Fallback";
    let model = "none";

    // 1. Groq
    if (groq) {
      try {
        const groqModel =
          complexity === "complex" ? GROQ_COMPLEX_MODEL : GROQ_SIMPLE_MODEL;
        const response = await withTimeout(
          groq.chat.completions.create({
            model: groqModel,
            messages,
            max_tokens: maxTokens as any,
            temperature: 0.2,
          }),
        );
        const content = (response as any).choices[0]?.message?.content?.trim();
        if (content) {
          reply = content;
          provider = "Groq";
          model = groqModel;
        }
      } catch (err: any) {
        console.warn(`[Groq failed]: ${err.message}`);
        const isRateOrSizeLimit =
          err.message?.includes("429") ||
          err.message?.includes("413") ||
          err.message?.toLowerCase().includes("rate limit") ||
          err.message?.toLowerCase().includes("rate_limit") ||
          err.message?.toLowerCase().includes("tokens per minute") ||
          err.message?.toLowerCase().includes("request too large");

        if (isRateOrSizeLimit) {
          const fallbackMaxTokens = Math.min(maxTokens, 1500);
          try {
            const fallbackResp = await withTimeout(
              groq.chat.completions.create({
                model: GROQ_FALLBACK_MODEL,
                messages,
                max_tokens: fallbackMaxTokens as any,
                temperature: 0.2,
              }),
            );
            const content = (fallbackResp as any).choices[0]?.message?.content?.trim();
            if (content) {
              reply = content;
              provider = "Groq";
              model = GROQ_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Groq fallback model failed]: ${fbErr.message}`);
            try {
              const tertResp = await withTimeout(
                groq.chat.completions.create({
                  model: GROQ_TERTIARY_MODEL,
                  messages,
                  max_tokens: fallbackMaxTokens as any,
                  temperature: 0.2,
                }),
              );
              const tertContent = (tertResp as any).choices[0]?.message?.content?.trim();
              if (tertContent) {
                reply = tertContent;
                provider = "Groq";
                model = GROQ_TERTIARY_MODEL;
              }
            } catch (tertErr: any) {
              console.warn(`[Groq tertiary model failed]: ${tertErr.message}`);
            }
          }
        }
      }
    }

    // 1b. Groq Secondary Key (if configured)
    if (!reply && groqSecondary) {
      try {
        const groqModel =
          complexity === "complex" ? GROQ_COMPLEX_MODEL : GROQ_SIMPLE_MODEL;
        const response = await withTimeout(
          groqSecondary.chat.completions.create({
            model: groqModel,
            messages,
            max_tokens: maxTokens as any,
            temperature: 0.2,
          }),
        );
        const content = (response as any).choices[0]?.message?.content?.trim();
        if (content) {
          reply = content;
          provider = "Groq-Secondary";
          model = groqModel;
        }
      } catch (err: any) {
        console.warn(`[Groq Secondary failed]: ${err.message}`);
        const isRateOrSizeLimit =
          err.message?.includes("429") ||
          err.message?.includes("413") ||
          err.message?.toLowerCase().includes("rate limit") ||
          err.message?.toLowerCase().includes("rate_limit") ||
          err.message?.toLowerCase().includes("tokens per minute") ||
          err.message?.toLowerCase().includes("request too large");

        if (isRateOrSizeLimit) {
          const fallbackMaxTokens = Math.min(maxTokens, 1500);
          try {
            const fallbackResp = await withTimeout(
              groqSecondary.chat.completions.create({
                model: GROQ_FALLBACK_MODEL,
                messages,
                max_tokens: fallbackMaxTokens as any,
                temperature: 0.2,
              }),
            );
            const content = (fallbackResp as any).choices[0]?.message?.content?.trim();
            if (content) {
              reply = content;
              provider = "Groq-Secondary";
              model = GROQ_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Groq Secondary fallback model failed]: ${fbErr.message}`);
            try {
              const tertResp = await withTimeout(
                groqSecondary.chat.completions.create({
                  model: GROQ_TERTIARY_MODEL,
                  messages,
                  max_tokens: fallbackMaxTokens as any,
                  temperature: 0.2,
                }),
              );
              const tertContent = (tertResp as any).choices[0]?.message?.content?.trim();
              if (tertContent) {
                reply = tertContent;
                provider = "Groq-Secondary";
                model = GROQ_TERTIARY_MODEL;
              }
            } catch (tertErr: any) {
              console.warn(`[Groq Secondary tertiary model failed]: ${tertErr.message}`);
            }
          }
        }
      }
    }

    // 2. OpenRouter (Primary Key Cascade)
    if (!reply && env.OPENROUTER_API_KEY) {
      for (const m of [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL, OPENROUTER_TERTIARY_MODEL]) {
        const content = await queryOpenRouter(env.OPENROUTER_API_KEY, m, messages, maxTokens);
        if (content) {
          reply = content;
          provider = "OpenRouter";
          model = m;
          break;
        }
      }
    }

    // 2b. OpenRouter Secondary Key (Secondary Key Cascade)
    if (!reply && env.OPENROUTER_API_KEY_SECONDARY) {
      for (const m of [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL, OPENROUTER_TERTIARY_MODEL]) {
        const content = await queryOpenRouter(env.OPENROUTER_API_KEY_SECONDARY, m, messages, maxTokens);
        if (content) {
          reply = content;
          provider = "OpenRouter-Secondary";
          model = m;
          break;
        }
      }
    }

    // 3. Gemini
    if (!reply && gemini) {
      for (const m of [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]) {
        try {
          const conversationText = [
            ...recentHistory.map((item) => `${item.role}: ${item.content}`),
            `user: ${cleanMessage}`,
          ].join("\n");

          const response = await withTimeout(
            gemini.models.generateContent({
              model: m,
              contents: conversationText,
              config: {
                systemInstruction: systemPrompt,
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: Math.max(maxTokens + 2500, 4096) as any,
                temperature: 0.2,
              },
            }),
            35000,
          );
          const content = response.text?.trim();
          if (content) {
            reply = content;
            provider = "Gemini";
            model = m;
            break;
          }
        } catch (err: any) {
          console.warn(`[Gemini ${m} failed]: ${err.message}`);
        }
      }
    }

    // 4. Mistral
    if (!reply && mistral) {
      try {
        const response = await withTimeout(
          mistral.chat.complete({
            model: MISTRAL_MODEL,
            messages,
            maxTokens: maxTokens,
            temperature: 0.2,
          }),
        );
        const content = (response as any).choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
          reply = content.trim();
          provider = "Mistral";
          model = MISTRAL_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Mistral failed]: ${err.message}`);
        if (err.message?.includes("429") || err.message?.includes("Rate limit")) {
          try {
            const fallbackResp = await withTimeout(
              mistral.chat.complete({
                model: MISTRAL_FALLBACK_MODEL,
                messages,
                maxTokens: maxTokens,
                temperature: 0.2,
              }),
              25000,
            );
            const fbContent = (fallbackResp as any).choices?.[0]?.message?.content;
            if (typeof fbContent === "string" && fbContent.trim()) {
              reply = fbContent.trim();
              provider = "Mistral";
              model = MISTRAL_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Mistral fallback model failed]: ${fbErr.message}`);
          }
        }
      }
    }

    if (!reply) {
      reply = `**AI Pather Assistant:** I am currently operating in offline mode. Please review your active Roadmap milestones and Skill Gaps dashboard to continue your learning journey.`;
    } else {
      reply = ensureCleanResponseCompletion(reply);
    }

    this.logAiUsage(
      provider,
      model,
      "CHAT",
      reply.includes("offline mode") ? "FAILURE" : "SUCCESS",
      0,
      0,
      reply.includes("offline mode") ? "All providers failed" : undefined,
    ).catch(console.error);

    return { reply, provider, model, complexity };
  }

  /**
   * Specifically designed for system tasks (like Diagnostic and Roadmap generation)
   * that require raw JSON output, bypassing the conversational AI limits and system prompts.
   */
  static async processJsonCompletion(
    systemInstruction: string,
    userPrompt: string,
    timeoutMs: number = 12000
  ): Promise<{ reply: string; provider: string; model: string }> {
    const maxTokens = 2500; // Allow enough space for complex JSON arrays
    const messages = [
      { 
        role: "system" as const, 
        content: `${systemInstruction}\n\nIMPORTANT:\nReturn ONLY valid JSON.\nThe response must be a valid JSON object.`
      },
      { role: "user" as const, content: userPrompt },
    ];

    let reply = "";
    let provider = "Fallback";
    let model = "none";

    // 1. Groq (Force complex model for reasoning)
    const attemptTimeout = Math.min(timeoutMs, 6000);
    if (groq) {
      try {
        const response = await withTimeout(
          groq.chat.completions.create({
            model: GROQ_COMPLEX_MODEL,
            messages,
            max_tokens: maxTokens as any,
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
          attemptTimeout
        );
        const content = (response as any).choices[0]?.message?.content?.trim();
        if (content) {
          reply = extractValidJsonString(content);
          provider = "Groq";
          model = GROQ_COMPLEX_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Groq JSON failed]: ${err.message}`);
        // If rate limit (429), token limit, or timeout on primary model, immediately try fallback models on Groq!
        if (
          err.message?.includes("429") ||
          err.message?.includes("Rate limit") ||
          err.message?.includes("tokens") ||
          err.message?.includes("Timeout")
        ) {
          try {
            const fallbackResp = await withTimeout(
              groq.chat.completions.create({
                model: GROQ_FALLBACK_MODEL,
                messages,
                max_tokens: Math.min(maxTokens, 950) as any,
                temperature: 0.1,
                response_format: { type: "json_object" },
              }),
              attemptTimeout
            );
            const fbContent = (fallbackResp as any).choices[0]?.message?.content?.trim();
            if (fbContent) {
              reply = extractValidJsonString(fbContent);
              provider = "Groq";
              model = GROQ_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Groq fallback model JSON failed]: ${fbErr.message}`);
            try {
              const tertResp = await withTimeout(
                groq.chat.completions.create({
                  model: GROQ_TERTIARY_MODEL,
                  messages,
                  max_tokens: maxTokens as any,
                  temperature: 0.1,
                  response_format: { type: "json_object" },
                }),
                timeoutMs
              );
              const tertContent = (tertResp as any).choices[0]?.message?.content?.trim();
              if (tertContent) {
                reply = extractValidJsonString(tertContent);
                provider = "Groq";
                model = GROQ_TERTIARY_MODEL;
              }
            } catch (tertErr: any) {
              console.warn(`[Groq tertiary model JSON failed]: ${tertErr.message}`);
            }
          }
        }
      }
    }

    // 1b. Groq Secondary Key (if configured)
    if (!reply && groqSecondary) {
      try {
        const response = await withTimeout(
          groqSecondary.chat.completions.create({
            model: GROQ_COMPLEX_MODEL,
            messages,
            max_tokens: maxTokens as any,
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
          timeoutMs
        );
        const content = (response as any).choices[0]?.message?.content?.trim();
        if (content) {
          reply = extractValidJsonString(content);
          provider = "Groq-Secondary";
          model = GROQ_COMPLEX_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Groq Secondary JSON failed]: ${err.message}`);
        if (err.message?.includes("429") || err.message?.includes("Rate limit") || err.message?.includes("tokens")) {
          try {
            const fallbackResp = await withTimeout(
              groqSecondary.chat.completions.create({
                model: GROQ_FALLBACK_MODEL,
                messages,
                max_tokens: Math.min(maxTokens, 950) as any,
                temperature: 0.1,
                response_format: { type: "json_object" },
              }),
              timeoutMs
            );
            const fbContent = (fallbackResp as any).choices[0]?.message?.content?.trim();
            if (fbContent) {
              reply = extractValidJsonString(fbContent);
              provider = "Groq-Secondary";
              model = GROQ_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Groq Secondary fallback model JSON failed]: ${fbErr.message}`);
            try {
              const tertResp = await withTimeout(
                groqSecondary.chat.completions.create({
                  model: GROQ_TERTIARY_MODEL,
                  messages,
                  max_tokens: maxTokens as any,
                  temperature: 0.1,
                  response_format: { type: "json_object" },
                }),
                timeoutMs
              );
              const tertContent = (tertResp as any).choices[0]?.message?.content?.trim();
              if (tertContent) {
                reply = extractValidJsonString(tertContent);
                provider = "Groq-Secondary";
                model = GROQ_TERTIARY_MODEL;
              }
            } catch (tertErr: any) {
              console.warn(`[Groq Secondary tertiary model JSON failed]: ${tertErr.message}`);
            }
          }
        }
      }
    }

    // 2. OpenRouter (Primary Key JSON Cascade)
    if (!reply && env.OPENROUTER_API_KEY) {
      for (const m of [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL, OPENROUTER_TERTIARY_MODEL]) {
        const content = await queryOpenRouter(env.OPENROUTER_API_KEY, m, messages, maxTokens, true, timeoutMs);
        if (content) {
          reply = extractValidJsonString(content);
          provider = "OpenRouter";
          model = m;
          break;
        }
      }
    }

    // 2b. OpenRouter Secondary Key (Secondary Key JSON Cascade)
    if (!reply && env.OPENROUTER_API_KEY_SECONDARY) {
      for (const m of [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL, OPENROUTER_TERTIARY_MODEL]) {
        const content = await queryOpenRouter(env.OPENROUTER_API_KEY_SECONDARY, m, messages, maxTokens, true, timeoutMs);
        if (content) {
          reply = extractValidJsonString(content);
          provider = "OpenRouter-Secondary";
          model = m;
          break;
        }
      }
    }

    // 3. Gemini
    if (!reply && gemini) {
      for (const m of [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]) {
        try {
          const response = await withTimeout(
            gemini.models.generateContent({
              model: m,
              contents: `user: ${userPrompt}`,
              config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: Math.max(maxTokens + 2500, 4096) as any,
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
            Math.max(timeoutMs, 35000),
          );
          const content = response.text?.trim();
          if (content) {
            reply = extractValidJsonString(content);
            provider = "Gemini";
            model = m;
            break;
          }
        } catch (err: any) {
          console.warn(`[Gemini ${m} JSON failed]: ${err.message}`);
        }
      }
    }

    // 4. Mistral
    if (!reply && mistral) {
      try {
        const response = await withTimeout(
          mistral.chat.complete({
            model: MISTRAL_MODEL,
            messages,
            maxTokens: maxTokens,
            temperature: 0.1,
            responseFormat: { type: "json_object" },
          }),
          timeoutMs
        );
        const content = (response as any).choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
          reply = extractValidJsonString(content.trim());
          provider = "Mistral";
          model = MISTRAL_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Mistral JSON failed]: ${err.message}`);
        if (err.message?.includes("429") || err.message?.includes("Rate limit")) {
          try {
            const fallbackResp = await withTimeout(
              mistral.chat.complete({
                model: MISTRAL_FALLBACK_MODEL,
                messages,
                maxTokens: maxTokens,
                temperature: 0.1,
                responseFormat: { type: "json_object" },
              }),
              Math.max(timeoutMs, 25000)
            );
            const fbContent = (fallbackResp as any).choices?.[0]?.message?.content;
            if (typeof fbContent === "string" && fbContent.trim()) {
              reply = extractValidJsonString(fbContent.trim());
              provider = "Mistral";
              model = MISTRAL_FALLBACK_MODEL;
            }
          } catch (fbErr: any) {
            console.warn(`[Mistral fallback model JSON failed]: ${fbErr.message}`);
          }
        }
      }
    }

    if (!reply) {
      this.logAiUsage("Fallback", "none", "JSON_COMPLETION", "FAILURE", 0, 0, "All AI providers failed to generate JSON completion").catch(console.error);
      throw new Error("All AI providers failed to generate JSON completion");
    }

    reply = extractValidJsonString(reply);
    this.logAiUsage(provider, model, "JSON_COMPLETION", "SUCCESS").catch(console.error);

    return { reply, provider, model };
  }

  static async checkHealth(): Promise<{ status: string; responseTime: number; error?: string }> {
    const start = Date.now();
    try {
      // Make a very simple JSON completion call to verify the AI provider is responding
      const result = await this.processJsonCompletion(
        "You are a health check bot. Reply with exactly: {\"status\":\"ok\"}",
        "Health check"
      );
      return { 
        status: "✓ " + result.provider, 
        responseTime: Date.now() - start 
      };
    } catch (err: any) {
      return { 
        status: "✗", 
        responseTime: Date.now() - start,
        error: err.message 
      };
    }
  }
}

