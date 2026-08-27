"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import { sendCareerCopilotMessage } from "@/src/lib/actions/career-copilot";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

import { authClient } from "@/src/lib/auth-client";

export default function CareerCopilotCard({ data }: { data?: DashboardData }) {
  const { data: session } = authClient.useSession();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  if (!session?.user?.id) {
    return null;
  }
  const userId = session.user.id;

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendCareerCopilotMessage(userId, messageText);
      if (response.success) {
        setMessages((prev) => [...prev, { role: "ai", text: response.data.reply }]);
      }
    } catch (error) {
      console.error("Copilot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Card mouseGlow className="col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden border-primary/20 flex flex-col h-full min-h-[300px]">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="w-5 h-5" /> AI Career Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col relative z-10 flex-1">
        <p className="text-muted-foreground mb-4">Ask anything about your career.</p>
        
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 max-h-[150px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`text-sm p-3 rounded-xl max-w-[85%] ${msg.role === "user" ? "bg-primary/10 ml-auto border border-primary/20" : "bg-card-soft border border-border"}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-sm p-3 rounded-xl bg-card-soft border border-border max-w-[85%] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Thinking...
              </div>
            )}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 bg-card-soft rounded-xl border border-border p-2 focus-within:border-primary/50 transition-colors">
            <input 
              type="text" 
              placeholder="Ask Career Copilot..."
              className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-muted-foreground"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-secondary p-2 rounded-lg shrink-0 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {messages.length === 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2 self-center">Suggested</span>
              <button 
                onClick={() => handleSend("What should I learn today?")}
                className="text-xs bg-muted hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-transparent cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> What should I learn today?
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
