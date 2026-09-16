import { serverFetch, serverMutation } from "../../core/server";

export interface TestPromptPayload {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const getAiSandboxModels = async (userId: string) => {
  return await serverFetch(`/api/admin/ai-sandbox/models?userId=${userId}`);
};

export const testAiSandboxPrompt = async (userId: string, payload: TestPromptPayload) => {
  return await serverMutation(`/api/admin/ai-sandbox/test?userId=${userId}`, payload, "POST");
};
