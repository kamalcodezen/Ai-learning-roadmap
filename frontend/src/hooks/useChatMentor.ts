"use client";

import { useState } from "react";
import {
  sendChatMessage,
  type ChatMessage,
} from "@/src/lib/api/chat-ai-mentor/chat";

export function useChatMentor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        history: updatedMessages.slice(-4), // টোকেন অপ্টিমাইজেশন
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    clearChat,
  };
}
