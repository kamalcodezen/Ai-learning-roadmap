import Groq from "groq-sdk";
import env from "../../../config/env.js";
import prisma from "../../../lib/prisma.js";

export interface AiSandboxPromptInput {
  prompt: string;
  systemPrompt?: string | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  adminId?: string | undefined;
}

export interface AiSandboxModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: string;
}

export interface AiSandboxTelemetryResult {
  reply: string;
  model: string;
  provider: string;
  latency: number;
  temperature: number;
  isError?: boolean;
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const groqKeys = [
  env.GROQ_API_KEY,
  env.GROQ_API_KEY_SECONDARY,
  env.GROQ_API_KEY_3 || (process.env.GROQ_API_KEY_TERTIARY || ""),
  env.GROQ_API_KEY_4 || (process.env.GROQ_API_KEY_QUATERNARY || ""),
].filter((k): k is string => Boolean(k && k.trim()));

const groqClients = groqKeys.map((apiKey) => new Groq({ apiKey }));

export const AVAILABLE_MODELS = [
  {
    id: "qwen/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    provider: "Groq",
    description: "High-capacity multilingual and coding capability model.",
    speed: "Fast (450 T/s)",
  },
  {
    id: "groq/compound-mini",
    name: "Groq Compound Mini",
    provider: "Groq",
    description: "Ultra-low latency, highly responsive general intelligence model.",
    speed: "Instant (750 T/s)",
  },
  {
    id: "groq/compound",
    name: "Groq Compound Reasoning",
    provider: "Groq",
    description: "Deep reasoning model for architecture and curriculum planning.",
    speed: "Fast (320 T/s)",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B Reasoning",
    provider: "Groq",
    description: "Deep reasoning, large open-weights model for curriculum architecting.",
    speed: "Ultra-Fast (320 T/s)",
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "Groq",
    description: "Balanced reasoning model optimized for diagnostic rubrics.",
    speed: "Fast (550 T/s)",
  },
];

export async function getModelList() {
  const client = groqClients[0];
  if (!client) return AVAILABLE_MODELS;

  try {
    const list = await client.models.list();
    if (list?.data && Array.isArray(list.data) && list.data.length > 0) {
      const activeIds = new Set(list.data.map((m: { id: string }) => m.id));
      const filtered = AVAILABLE_MODELS.filter((m) => activeIds.has(m.id));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // Fallback to static verified list if models.list is restricted
  }
  return AVAILABLE_MODELS;
}

export async function testAiPrompt(input: AiSandboxPromptInput) {
  const {
    prompt,
    systemPrompt = "You are an AI Curriculum Architect and Career Mentor for the AI Pather platform. Provide structured, concise, and expert guidance.",
    model = "qwen/qwen3.8-27b",
    temperature = 0.7,
    maxTokens = 1000,
    adminId,
  } = input;

  if (groqClients.length === 0) {
    const startTime = Date.now();
    await new Promise((r) => setTimeout(r, 450));
    const latency = Date.now() - startTime;

    const simulatedReply = `### Simulated Output for [${model}]
**System Persona:** ${systemPrompt}

**Response to Prompt:**
> "${prompt}"

1. **Architecture & Scope**: Comprehensive roadmap step generation validated.
2. **Pedagogical Flow**: Progressive complexity from foundational to advanced capstones.
3. **Validation**: All diagnostic milestones aligned with industry job reality expectations.

*Telemetry: Completed in ${latency}ms using simulated gateway node.*`;

    return {
      reply: simulatedReply,
      model,
      provider: "Groq (Simulated)",
      latency,
      temperature,
      tokens: {
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(simulatedReply.length / 4),
        totalTokens: Math.round((prompt.length + simulatedReply.length) / 4),
      },
    };
  }

  const startTime = Date.now();
  const modelsToTry = [
    model,
    "qwen/qwen3.8-27b",
    "groq/compound-mini",
    "groq/compound",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  let lastError: Error | null = null;

  for (const client of groqClients) {
    for (const activeModel of modelsToTry) {
      try {
        const completion = await client.chat.completions.create({
          model: activeModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: Number(temperature),
          max_tokens: Number(maxTokens),
        });

      const latency = Date.now() - startTime;
      const reply = completion.choices[0]?.message?.content || "No response generated.";
      const usage = completion.usage;

      // Background telemetry logging
      try {
        await prisma.aiUsageLog.create({
          data: {
            provider: "GROQ",
            model: activeModel,
            feature: "ADMIN_SANDBOX",
            status: "SUCCESS",
            metadata: {
              latency,
              temperature,
              adminId,
              tokens: usage?.total_tokens,
            },
          },
        });
      } catch {
        // non-critical
      }

      return {
        reply,
        model: activeModel,
        provider: "Groq Cloud",
        latency,
        temperature,
        tokens: {
          promptTokens: usage?.prompt_tokens || Math.round(prompt.length / 4),
          completionTokens: usage?.completion_tokens || Math.round(reply.length / 4),
          totalTokens: usage?.total_tokens || Math.round((prompt.length + reply.length) / 4),
        },
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Sandbox] Model ${activeModel} failed: ${err.message}. Trying next available fallback...`);
      }
    }
  }

  const latency = Date.now() - startTime;
  return {
    reply: `Inference Error: ${lastError?.message || "All models failed to respond."}`,
    model,
    provider: "Groq Cloud",
    latency,
    temperature,
    isError: true,
    tokens: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
}
