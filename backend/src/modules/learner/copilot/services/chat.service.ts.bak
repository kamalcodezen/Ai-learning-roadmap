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
const gemini = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;
const mistral = env.MISTRAL_API_KEY
  ? new Mistral({ apiKey: env.MISTRAL_API_KEY })
  : null;

// Models
const GROQ_SIMPLE_MODEL = "openai/gpt-oss-120b";
const GROQ_COMPLEX_MODEL = "openai/gpt-oss-120b";
const OPENROUTER_MODEL = "qwen/qwen-2.5-coder-32b-instruct";
const GEMINI_MODEL = "gemini-3.6-flash";
const MISTRAL_MODEL = "mistral-small-latest";

const OUTPUT_LIMITS: Record<QueryComplexity, number> = {
  simple: 450,
  normal: 700,
  complex: 1200,
};

const PROVIDER_TIMEOUT_MS = 6000;

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

import prisma from "../../../../lib/prisma.js";

export class ChatService {
  static async fetchUserContext(userId: string, message: string): Promise<string | undefined> {
    const normalized = message.toLowerCase();
    // For personalization, we should ideally always inject context if it exists,
    // but to save tokens, we only inject when the query might need it.
    // However, the prompt requires the AI to answer based on this context "whenever the question is career/learning related."
    // We'll broaden the keyword check slightly, but it was already decent.
    const needsContext = ["learn", "roadmap", "progress", "skill", "gap", "career", "role", "project", "assessment", "study", "plan", "framework", "tech", "stack", "build", "explain", "next", "milestone"].some(kw => normalized.includes(kw));
    
    if (!needsContext) return undefined;

    try {
      const [profile, roadmap, allSkillStates] = await Promise.all([
        prisma.careerProfile.findUnique({ where: { userId } }),
        prisma.roadmap.findFirst({
          where: { userId, status: "ACTIVE" },
          include: { milestones: { orderBy: { order: "asc" } } }
        }),
        prisma.skillState.findMany({ 
          where: { userId },
        })
      ]);
      
      if (!profile) {
        return "USER CAREER CONTEXT:\nNo onboarding data found. The user has not set up a career profile, skills, or a roadmap yet. You should politely ask them to complete onboarding to get a personalized experience.";
      }

      const roleName = profile.targetRoleName || profile.targetRole || "Unknown Role";
      const experience = profile.experienceLevel || "Unknown Experience";
      const availability = profile.weeklyAvailableHours ? `${profile.weeklyAvailableHours} hours/week` : "Unknown";
      
      let contextStr = `USER CAREER CONTEXT:\n\nTarget Role:\n${roleName}\n\nExperience:\n${experience}\n\nStack:\nUnavailable (Not tracked in current onboarding)\n\nAvailability:\n${availability}\n\nGoal:\nUnavailable (Not tracked in current onboarding)\n\nCURRENT SKILLS:\n`;
      
      if (allSkillStates.length > 0) {
        contextStr += allSkillStates.map(s => `- ${s.skillName} (Score: ${Math.round(s.knowledgeScore)}/100)`).join("\n");
      } else {
        contextStr += "No skills assessed yet.";
      }
      
      contextStr += `\n\nACTIVE ROADMAP:\n`;
      if (roadmap) {
        contextStr += `${roadmap.targetRole} Roadmap (Status: ${roadmap.status})\n\n`;
        
        const currentMilestone = roadmap.milestones.find(m => m.status === "CURRENT") || roadmap.milestones.find(m => m.status === "UPCOMING") || roadmap.milestones[0];
        
        contextStr += `CURRENT MILESTONE:\n`;
        if (currentMilestone) {
          contextStr += `Title: ${currentMilestone.title}\n`;
          if (currentMilestone.description) contextStr += `Description: ${currentMilestone.description}\n`;
          if (currentMilestone.why) contextStr += `Why: ${currentMilestone.why}\n`;
        } else {
          contextStr += `None\n`;
        }
        
        const completedMilestones = roadmap.milestones.filter(m => m.status === "COMPLETED");
        contextStr += `\nCOMPLETED MILESTONES:\n`;
        if (completedMilestones.length > 0) {
          contextStr += completedMilestones.map(m => `- ${m.title}`).join("\n");
        } else {
          contextStr += `None`;
        }
        
      } else {
        contextStr += `No active roadmap found.\n\nCURRENT MILESTONE:\nNone\n\nCOMPLETED MILESTONES:\nNone`;
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
      }
    }

    // 2. OpenRouter
    if (!reply && env.OPENROUTER_API_KEY) {
      try {
        const response = await fetchWithTimeout(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: OPENROUTER_MODEL,
              messages,
              max_tokens: maxTokens as any,
              temperature: 0.2,
            }),
          },
        );
        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            reply = content;
            provider = "OpenRouter";
            model = OPENROUTER_MODEL;
          }
        }
      } catch (err: any) {
        console.warn(`[OpenRouter failed]: ${err.message}`);
      }
    }

    // 3. Gemini
    if (!reply && gemini) {
      try {
        const conversationText = [
          ...recentHistory.map((item) => `${item.role}: ${item.content}`),
          `user: ${cleanMessage}`,
        ].join("\n");

        const response = await withTimeout(
          gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: conversationText,
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: maxTokens as any,
              temperature: 0.2,
            },
          }),
        );
        const content = response.text?.trim();
        if (content) {
          reply = content;
          provider = "Gemini";
          model = GEMINI_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Gemini failed]: ${err.message}`);
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
      }
    }

    if (!reply) {
      reply = `**AI Pathar Telemetry:** Focus on your verifiable **Proof-of-Work** ($SHA-256$ Git commits) and clearing active **Learning Debt**. Calibrate your benchmark inside the **Career Readiness Twin**.`;
    }

    this.logAiUsage(provider, model, "CHAT", reply.includes("Telemetry") ? "FAILURE" : "SUCCESS", 0, 0, reply.includes("Telemetry") ? "All providers failed" : undefined).catch(console.error);

    return { reply, provider, model, complexity };
  }

  /**
   * Specifically designed for system tasks (like Diagnostic and Roadmap generation)
   * that require raw JSON output, bypassing the conversational AI limits and system prompts.
   */
  static async processJsonCompletion(
    systemInstruction: string,
    userPrompt: string
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
        );
        const content = (response as any).choices[0]?.message?.content?.trim();
        if (content) {
          reply = content;
          provider = "Groq";
          model = GROQ_COMPLEX_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Groq JSON failed]: ${err.message}`);
      }
    }

    // 2. OpenRouter
    if (!reply && env.OPENROUTER_API_KEY) {
      try {
        const response = await fetchWithTimeout(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: OPENROUTER_MODEL,
              messages,
              max_tokens: maxTokens as any,
              temperature: 0.1,
              response_format: { type: "json_object" },
            }),
          },
        );
        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            reply = content;
            provider = "OpenRouter";
            model = OPENROUTER_MODEL;
          }
        }
      } catch (err: any) {
        console.warn(`[OpenRouter JSON failed]: ${err.message}`);
      }
    }

    // 3. Gemini
    if (!reply && gemini) {
      try {
        const response = await withTimeout(
          gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: `user: ${userPrompt}`,
            config: {
              systemInstruction: systemInstruction,
              maxOutputTokens: maxTokens as any,
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        );
        const content = response.text?.trim();
        if (content) {
          reply = content;
          provider = "Gemini";
          model = GEMINI_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Gemini JSON failed]: ${err.message}`);
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
        );
        const content = (response as any).choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
          reply = content.trim();
          provider = "Mistral";
          model = MISTRAL_MODEL;
        }
      } catch (err: any) {
        console.warn(`[Mistral JSON failed]: ${err.message}`);
      }
    }

    if (!reply) {
      this.logAiUsage("Fallback", "none", "JSON_COMPLETION", "FAILURE", 0, 0, "All AI providers failed to generate JSON completion").catch(console.error);
      throw new Error("All AI providers failed to generate JSON completion");
    }

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

