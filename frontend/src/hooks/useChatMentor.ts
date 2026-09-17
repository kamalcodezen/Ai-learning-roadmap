"use client";

import { useEffect, useState } from "react";
import {
  sendChatMessage,
  clearChatHistory,
  type ChatMessage,
} from "@/src/lib/api/chat-ai-mentor/chat";

const STORAGE_KEY = "ai_pather_floating_chat_history";

export function useChatMentor() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved) as ChatMessage[];
        }
      } catch (e) {
        console.error("Error restoring chat history:", e);
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync messages to localStorage whenever they update
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error("Error saving chat history:", e);
      }
    }
  }, [messages]);

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: textToSend,
        history: updatedMessages.slice(-4), // Token optimization
      });

      const reply = response.data.reply;
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      return reply;
    } catch (error) {
      const fallbackText =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackText,
        },
      ]);
      return fallbackText;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error("Error clearing chat localStorage:", e);
      }
    }
    await clearChatHistory();
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    clearChat,
  };
}
