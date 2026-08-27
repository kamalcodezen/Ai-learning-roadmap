"use client";

import { useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import brandLogo from "../../../public/brand/logo-p-purple.png"

import {
  sendChatMessage,
  type ChatMessage,
} from "@/src/lib/api/chat-ai-mentor/chat";
import { Meteors } from "@/src/components/ui/meteors";
import Image from "next/image";

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    glowRef.current.style.opacity = "1";
    glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(159,84,247,0.10), transparent 40%)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!glowRef.current) return;
    glowRef.current.style.opacity = "0";
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    setMessages((previous) => [...previous, userMessage]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message,
        history: messages,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="group relative flex h-[calc(100vh-3rem)] w-full flex-col rounded-md border-2 border-zinc-200 dark:border-zinc-800 hover:border-brand transition-all duration-300 bg-background overflow-clip"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
      />
      <Meteors number={15} className="bg-primary/60" />
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* AI Pathar Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Image src={brandLogo} alt="Brand-logo" className="ml-1 w-4 h-4 md:w-5 md:h-5 dark:brightness-0 dark:invert" height={20} width={20}/>
          </div>

          {/* Brand */}
          <div>
            <h1 className="text-base font-semibold text-foreground">AI Pathar</h1>

            <p className="text-xs text-muted-foreground">Your AI Career Copilot</p>
          </div>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(159,84,247,0.8)]" />

          <span className="text-xs text-primary">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 bg-background">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-xl text-center">
              {/* Welcome Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/5 shadow-[0_0_40px_rgba(159,84,247,0.08)]">
                <Image src={brandLogo} alt="Brand-logo" className="ml-1 w-4 h-4 md:w-5 md:h-5 dark:brightness-0 dark:invert" height={20} width={20}/>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                How can I help you?
              </h2>

              {/* Description */}
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Your AI career copilot for personalized learning, skill growth,
                project guidance, interview preparation, and career development.
              </p>

              {/* Feature Suggestions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Create my personalized learning roadmap",
                  "Analyze my skills and suggest what to learn",
                  "Help me plan a real-world project",
                  "Prepare me for a technical interview",
                  "Review my career and skill gaps",
                  "Help me choose my next career step",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    disabled={isLoading}
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm leading-5 text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-7 sm:max-w-[85%] ${
                    message.role === "user"
                      ? "rounded-br-md bg-primary"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 mt-1 text-xl font-bold text-foreground">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-3 mt-5 text-lg font-bold text-foreground">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-4 text-base font-semibold text-foreground">
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="text-muted-foreground">{children}</em>
                          ),

                          ul: ({ children }) => (
                            <ul className="mb-4 ml-5 list-disc space-y-1.5">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="mb-4 ml-5 list-decimal space-y-1.5">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li className="pl-1">{children}</li>
                          ),

                          blockquote: ({ children }) => (
                            <blockquote className="my-4 border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
                              {children}
                            </blockquote>
                          ),

                          hr: () => <hr className="my-5 border-border" />,

                          code: ({ className, children, ...props }) => {
                            const isBlock = className?.includes("language-");

                            if (isBlock) {
                              return (
                                <code
                                  className="block whitespace-pre-wrap break-words text-xs leading-6 text-foreground sm:text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <code
                                className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[0.85em] text-primary"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },

                          pre: ({ children }) => (
                            <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4">
                              {children}
                            </pre>
                          ),

                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline decoration-primary/30 underline-offset-2 transition hover:text-primary/80"
                            >
                              {children}
                            </a>
                          ),

                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-xl border border-border">
                              <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">
                                {children}
                              </table>
                            </div>
                          ),

                          thead: ({ children }) => (
                            <thead className="bg-card text-foreground">
                              {children}
                            </thead>
                          ),

                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-border">
                              {children}
                            </tbody>
                          ),

                          tr: ({ children }) => (
                            <tr className="transition hover:bg-card-soft">
                              {children}
                            </tr>
                          ),

                          th: ({ children }) => (
                            <th className="border-r border-border px-3 py-2.5 font-semibold last:border-r-0">
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td className="border-r border-border px-3 py-2.5 align-top last:border-r-0">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap text-white/80">{message.content}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-border bg-card px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 sm:p-5">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-border bg-card p-2 transition focus-within:border-primary/30"
        >
          {/* Message Input */}
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={isLoading}
            rows={1}
            placeholder="Ask AI Pathar anything..."
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
        </form>

        {/* Disclaimer */}
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI Pathar can make mistakes. Verify important information.
        </p>
      </div>
    </section>
  );
}
