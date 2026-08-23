"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatMentor } from "@/src/hooks/useChatMentor";
import logoSrc from "../../../public/brand/AI-Pather-blue.png";
import { PlasmaTriggerButton } from "./PlasmaTriggerButton";
import { TypingIndicator } from "./TypingIndicator";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function HomeFloatingChat() {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, isLoading, sendMessage } = useChatMentor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, isLoading, open, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage();
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto font-sans">
      {/* Plasma Animated Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-3 flex h-[590px] max-h-[86vh] w-[385px] sm:w-[445px] flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-[#f4ffd6] via-[#eaffbd] to-[#dff5a5] dark:from-[#0f2a02] dark:via-[#1a3a05] dark:to-[#304c0a] text-zinc-950 dark:text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[#a8d844]/60 dark:border-[#CEFF1F]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Plasma Animated Border Glow Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl animate-plasmaGlow z-0" />

            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-black/10 dark:border-[#CEFF1F]/20 px-5 py-4 bg-[#eaffbd]/70 dark:bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CEFF1F] shadow-[0_0_15px_rgba(206,255,31,0.5)] p-2">
                  <Image
                    src={logoSrc}
                    alt="AI Pathar"
                    width={22}
                    height={22}
                    className="h-5.5 w-5.5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-wide">
                    AI Pathar
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-[#131824] dark:bg-[#CEFF1F] shadow-[0_0_8px_rgba(206,255,31,0.8)]" />
                    <p className="text-xs text-zinc-800 dark:text-[#CEFF1F] font-semibold">
                      AI Career Copilot
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-zinc-800 dark:text-white transition-colors hover:bg-[#CEFF1F] hover:text-[#0B0F19]"
              >
                <X className="size-5" />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              onWheel={(e) => e.stopPropagation()}
              className="relative z-10 min-h-0 flex-1 space-y-4 overflow-y-scroll overscroll-contain p-4 outline-none scrollbar-thin scrollbar-thumb-zinc-600/30 dark:scrollbar-thumb-[#CEFF1F]/40 scrollbar-track-transparent"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center text-center p-2">
                  <div className="mb-3.5 flex h-16 w-16 items-center justify-center rounded-3xl border border-black/15 dark:border-[#CEFF1F]/40 bg-[#cce872]/60 dark:bg-[#CEFF1F]/15 text-zinc-950 dark:text-[#CEFF1F] shadow-[0_0_20px_rgba(206,255,31,0.3)]">
                    <Sparkles className="size-8" />
                  </div>
                  <h4 className="text-xl font-extrabold text-zinc-950 dark:text-white tracking-wide">
                    {"How can I help you?".split("").map((letter, index) => (
                      <span
                        key={index}
                        className="inline-block animate-loaderLetter text-zinc-950 dark:text-[#CEFF1F]"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </span>
                    ))}
                  </h4>
                  <p className="text-sm text-zinc-900 dark:text-zinc-200 font-medium mt-2 mb-5 max-w-[310px] leading-relaxed">
                    Your AI career copilot for personalized learning, skill
                    growth, project guidance, and interview prep.
                  </p>

                  <div className="flex flex-col gap-2.5 w-full">
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
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="rounded-2xl border border-black/10 dark:border-[#CEFF1F]/30 bg-[#eaffbd]/85 dark:bg-black/40 px-4 py-3 text-left text-sm font-semibold text-zinc-950 dark:text-zinc-100 transition hover:border-[#131824] dark:hover:border-[#CEFF1F] hover:bg-[#dff5a5] dark:hover:bg-[#CEFF1F]/20 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isUser = message.role === "user";
                  return (
                    <motion.div
                      key={`${message.role}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 12,
                        scale: 0.96,
                        x: isUser ? 20 : -20,
                      }}
                      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-end gap-2.5",
                          isUser && "flex-row-reverse",
                        )}
                      >
                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CEFF1F] shadow-[0_0_10px_rgba(206,255,31,0.4)] p-1.5">
                            <Image
                              src={logoSrc}
                              alt="AI"
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain"
                            />
                          </div>
                        )}
                        <motion.div
                          layout
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed",
                            isUser
                              ? "rounded-tr-md bg-[#131824] text-[#CEFF1F] dark:bg-[#CEFF1F] dark:text-[#0B0F19] shadow-[0_4px_16px_rgba(0,0,0,0.25)] font-bold"
                              : "rounded-tl-md border border-black/10 dark:border-[#CEFF1F]/30 bg-[#eaffbd]/95 dark:bg-black/70 text-zinc-950 dark:text-zinc-100 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                          )}
                          whileHover={{ scale: 1.01, y: -1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <div className="markdown-content prose dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-950 dark:text-zinc-100">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="mb-2 mt-1 text-base font-bold text-zinc-950 dark:text-white">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="mb-1.5 mt-2 text-sm font-bold text-zinc-950 dark:text-white">
                                      {children}
                                    </h2>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-2.5 last:mb-0 text-sm leading-relaxed font-medium">
                                      {children}
                                    </p>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-extrabold text-zinc-950 dark:text-[#CEFF1F]">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="text-zinc-800 dark:text-[#CEFF1F]/90 font-semibold">
                                      {children}
                                    </em>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="mb-2.5 ml-4 list-disc space-y-1.5 text-zinc-900 dark:text-zinc-200">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="mb-2.5 ml-4 list-decimal space-y-1.5 text-zinc-900 dark:text-zinc-200">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="pl-1 text-sm leading-relaxed">
                                      {children}
                                    </li>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="my-2.5 border-l-2 border-zinc-950 dark:border-[#CEFF1F] pl-3.5 italic text-zinc-800 dark:text-zinc-300 font-medium">
                                      {children}
                                    </blockquote>
                                  ),
                                  code: ({ className, children, ...props }) => {
                                    const isBlock =
                                      className?.includes("language-");
                                    return isBlock ? (
                                      <pre className="my-2.5 overflow-x-auto rounded-xl border border-black/20 dark:border-[#CEFF1F]/40 bg-black/90 p-3.5 text-xs text-[#CEFF1F]">
                                        <code {...props}>{children}</code>
                                      </pre>
                                    ) : (
                                      <code
                                        className="rounded bg-black/15 dark:bg-black/60 border border-black/10 dark:border-[#CEFF1F]/40 px-1.5 py-0.5 text-xs font-bold text-zinc-950 dark:text-[#CEFF1F]"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                  table: ({ children }) => (
                                    <div className="my-2.5 overflow-x-auto rounded-lg border border-black/15 dark:border-[#CEFF1F]/40">
                                      <table className="w-full text-left text-xs">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="border-b border-black/15 dark:border-[#CEFF1F]/40 bg-[#cce872]/80 dark:bg-[#0f2a02] p-2.5 font-bold text-zinc-950 dark:text-white">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="border-b border-black/10 dark:border-[#CEFF1F]/20 p-2.5 text-zinc-900 dark:text-zinc-200">
                                      {children}
                                    </td>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="relative z-10 shrink-0 border-t border-black/10 dark:border-[#CEFF1F]/20 p-3.5 bg-[#eaffbd]/80 dark:bg-black/75 backdrop-blur-md">
              <div className="flex items-center gap-2 rounded-2xl border-2 border-black/20 dark:border-[#CEFF1F]/40 bg-[#f4ffd6] dark:bg-[#071701] px-4 py-2.5 shadow-sm focus-within:border-black dark:focus-within:border-[#CEFF1F] transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Ask AI Pathar..."
                  className="flex-1 bg-transparent text-sm font-bold !text-black dark:!text-white outline-none placeholder:text-zinc-700 dark:placeholder:text-zinc-400 placeholder:font-medium disabled:cursor-not-allowed"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    input.trim() && !isLoading
                      ? "bg-[#131824] text-[#CEFF1F] dark:bg-[#CEFF1F] dark:text-[#0B0F19] shadow-md hover:brightness-110"
                      : "bg-black/15 text-zinc-600 dark:bg-white/10 dark:text-zinc-500 cursor-not-allowed",
                  )}
                >
                  <Send className="size-4.5" />
                </motion.button>
              </div>
              <p className="mt-2 text-center text-xs text-zinc-800 dark:text-zinc-300 font-semibold">
                AI Pathar can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REUSABLE TRIGGER BUTTON COMPONENT USAGE */}
      <PlasmaTriggerButton
        size={60}
        logo={logoSrc}
        isOpen={open}
        onClick={() => setOpen((prev) => !prev)}
      />
    </div>
  );
}
