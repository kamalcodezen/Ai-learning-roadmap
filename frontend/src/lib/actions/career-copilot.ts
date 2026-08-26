import { serverMutation } from "../core/server";

export interface CareerCopilotResponse {
  success: boolean;
  message: string;
  data: {
    reply: string;
  };
}

/**
 * Sends a message to the AI Career Copilot and retrieves the response.
 */
export const sendCareerCopilotMessage = async (userId: string, messageText: string, context?: string): Promise<CareerCopilotResponse> => {
  return await serverMutation(`/api/chat`, { userId, message: messageText, context });
};
