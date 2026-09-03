import { authClient } from "../../auth-client";
import { baseUrl } from "../../core/server";
import { ChatRequest, ChatResult } from "./chat";

export const streamChatMessage = async (
  payload: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone: (result: ChatResult) => void,
  onError: (error: string) => void,
  abortController?: AbortController
) => {
  try {
    const session = await authClient.getSession();
    const userId = session?.data?.user?.id;

    const optimizedPayload: ChatRequest = {
      ...payload,
      ...(userId && { userId }),
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

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
      },
      body: JSON.stringify(optimizedPayload),
      signal: abortController?.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || errorData?.error || "Network error");
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      
      // Leave the last incomplete chunk in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("data: ")) continue;

        const dataStr = trimmedLine.replace(/^data: /, "");
        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "chunk" && parsed.content) {
            onChunk(parsed.content);
          } else if (parsed.type === "done") {
            onDone({
              reply: parsed.reply,
              provider: parsed.provider,
              model: parsed.model,
              complexity: parsed.complexity
            });
          } else if (parsed.type === "error") {
            throw new Error(parsed.message || "Stream error");
          }
        } catch (err: unknown) {
          if ((err as Error).message && (err as Error).message !== "Unexpected end of JSON input") {
            throw err;
          }
        }
      }
    }
  } catch (err: unknown) {
    if ((err as Error).name === "AbortError") {
      onError("Request cancelled.");
    } else {
      onError((err as Error).message || "Failed to stream chat.");
    }
  }
};
