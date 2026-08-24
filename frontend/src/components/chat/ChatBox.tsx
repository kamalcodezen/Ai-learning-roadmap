"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  sendChatMessage,
  type ChatMessage,
} from "@/src/lib/api/chat-ai-mentor/chat";

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <section className="flex h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* AI Pathar Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/20">
            <span className="text-lg font-bold text-emerald-400">AI</span>
          </div>

          {/* Brand */}
          <div>
            <h1 className="text-base font-semibold text-white">AI Pathar</h1>

            <p className="text-xs text-zinc-500">Your AI Career Copilot</p>
          </div>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

          <span className="text-xs text-emerald-300">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-xl text-center">
              {/* Welcome Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_40px_rgba(52,211,153,0.08)]">
                <span className="text-2xl text-emerald-400">✦</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                How can I help you?
              </h2>

              {/* Description */}
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
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
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm leading-5 text-zinc-400 transition hover:border-emerald-400/30 hover:bg-emerald-400/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                      ? "rounded-br-md bg-emerald-400 text-black"
                      : "rounded-bl-md border border-white/10 bg-white/[0.05] text-zinc-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 mt-1 text-xl font-bold text-white">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-3 mt-5 text-lg font-bold text-white">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-4 text-base font-semibold text-white">
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-semibold text-white">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="text-zinc-300">{children}</em>
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
                            <blockquote className="my-4 border-l-2 border-emerald-400/50 pl-4 italic text-zinc-400">
                              {children}
                            </blockquote>
                          ),

                          hr: () => <hr className="my-5 border-white/10" />,

                          code: ({ className, children, ...props }) => {
                            const isBlock = className?.includes("language-");

                            if (isBlock) {
                              return (
                                <code
                                  className="block whitespace-pre-wrap break-words text-xs leading-6 text-zinc-200 sm:text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <code
                                className="rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 text-[0.85em] text-emerald-300"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },

                          pre: ({ children }) => (
                            <pre className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4">
                              {children}
                            </pre>
                          ),

                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-2 transition hover:text-emerald-300"
                            >
                              {children}
                            </a>
                          ),

                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                              <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">
                                {children}
                              </table>
                            </div>
                          ),

                          thead: ({ children }) => (
                            <thead className="bg-white/[0.06] text-white">
                              {children}
                            </thead>
                          ),

                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-white/10">
                              {children}
                            </tbody>
                          ),

                          tr: ({ children }) => (
                            <tr className="transition hover:bg-white/[0.03]">
                              {children}
                            </tr>
                          ),

                          th: ({ children }) => (
                            <th className="border-r border-white/10 px-3 py-2.5 font-semibold last:border-r-0">
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td className="border-r border-white/10 px-3 py-2.5 align-top last:border-r-0">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:120ms]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 sm:p-5">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-emerald-400/30"
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
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-lg font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
        </form>

        {/* Disclaimer */}
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          AI Pathar can make mistakes. Verify important information.
        </p>
      </div>
    </section>
  );
}
