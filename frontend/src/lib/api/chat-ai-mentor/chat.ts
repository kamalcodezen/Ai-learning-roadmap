import { serverMutation } from "../../core/server";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: string;
  userId?: string;
}

export interface ChatResult {
  reply: string;
  provider: string;
  model: string;
  complexity: "simple" | "normal" | "complex";
}

export interface ChatResponse {
  success: boolean;
  data: ChatResult;
}

export const sendChatMessage = async (
  payload: ChatRequest,
): Promise<ChatResponse> => {
  // ফ্রন্টএন্ড থেকে শুধু শেষ ৪টি প্রাসঙ্গিক মেসেজ যাবে
  const optimizedPayload: ChatRequest = {
    ...payload,
    history: payload.history
      ? payload.history
          .filter(
            (msg) =>
              msg &&
              typeof msg.content === "string" &&
              msg.content.trim().length > 0,
          )
          .slice(-4)
      : [],
  };

  return serverMutation("/api/chat", optimizedPayload);
};
