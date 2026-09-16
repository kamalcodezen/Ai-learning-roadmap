import { serverFetch, serverMutation } from "../../core/server";

export interface TestPromptPayload {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiSandboxModelItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: string;
}

export interface AiSandboxModelsResponse {
  models: AiSandboxModelItem[];
}

export interface AiSandboxTestResponse {
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

/**
 * Retrieves the catalog of active AI inference models.
 */
export const getAiSandboxModels = async (userId: string): Promise<AiSandboxModelsResponse> => {
  return await serverFetch(`/api/admin/ai-sandbox/models?userId=${userId}`);
};

/**
 * Submits a test prompt to the selected LLM and records performance telemetry.
 */
export const testAiSandboxPrompt = async (
  userId: string,
  payload: TestPromptPayload
): Promise<AiSandboxTestResponse> => {
  return await serverMutation(`/api/admin/ai-sandbox/test?userId=${userId}`, payload, "POST");
};
