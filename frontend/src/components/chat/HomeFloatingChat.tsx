"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authClient } from "@/src/lib/auth-client";
import { useChatMentor } from "@/src/hooks/useChatMentor";
import logoSrc from "../../../public/brand/AI-Pather-blue.png";
import brandLogo from "../../../public/brand/logo-p-purple.png";
import { PlasmaTriggerButton } from "./PlasmaTriggerButton";
import { TypingIndicator } from "./TypingIndicator";

function getTimeGreeting(): string {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) {
    return "Good morning";
  }
  if (hours >= 12 && hours < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function HomeFloatingChat() {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, isLoading, sendMessage } = useChatMentor();
  const { data: session } = authClient.useSession();
  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeGreeting(getTimeGreeting());
    const interval = setInterval(() => {
      setTimeGreeting(getTimeGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const rawName = session?.user?.name?.trim();
  const userName = rawName ? rawName.split(/\s+/)[0] : undefined;
  const greeting = userName ? `${timeGreeting}, ${userName}` : timeGreeting;

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
            className="relative mb-3 flex h-[590px] max-h-[86vh] w-[385px] sm:w-[445px] flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-[#f3e8ff] via-[#ede5ff] to-[#ddd0ff] dark:from-[#0a0015] dark:via-[#120025] dark:to-[#1a0040] text-zinc-950 dark:text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[var(--color-primary)]/40 dark:border-[var(--color-primary)]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Plasma Animated Border Glow Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl animate-plasmaGlow z-0" />

            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-black/10 dark:border-[var(--color-primary)]/20 px-5 py-4 bg-purple-50/70 dark:bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[0_0_15px_rgba(159,84,247,0.5)] p-2">
                  <Image
                    src={logoSrc}
                    alt="AI Pathar"
                    width={22}
                    height={22}
                    className="h-5.5 w-5.5 object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-wide">
                    AI Pathar
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] dark:bg-[var(--color-primary)] shadow-[0_0_8px_rgba(159,84,247,0.8)]" />
                    <p className="text-xs text-zinc-800 dark:text-[var(--color-primary)] font-semibold">
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
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-zinc-800 dark:text-white transition-colors hover:bg-[var(--color-primary)] hover:text-white"
              >
                <X className="size-5" />
              </motion.button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              onWheel={(e) => e.stopPropagation()}
              className="relative z-10 min-h-0 flex-1 space-y-4 overflow-y-scroll overscroll-contain p-4 outline-none scrollbar-thin scrollbar-thumb-zinc-600/30 dark:scrollbar-thumb-[var(--color-primary)]/40 scrollbar-track-transparent"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-between text-center p-4 pt-10">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex items-center justify-center">
                      <Image
                        src={brandLogo}
                        alt="AI Pathar"
                        width={44}
                        height={44}
                        className="h-11 w-11 object-contain"
                      />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                      {greeting}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full mb-2">
                    {[
                      "Create my personalized learning roadmap",
                      "Analyze my skills and suggest what to learn",
                      "Help me plan a real-world project",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        disabled={isLoading}
                        className="rounded-2xl border border-black/10 dark:border-[var(--color-primary)]/30 bg-purple-100/85 dark:bg-black/40 px-4 py-3 text-left text-sm font-semibold text-zinc-950 dark:text-zinc-100 transition hover:border-black dark:hover:border-[var(--color-primary)] hover:bg-purple-200 dark:hover:bg-[var(--color-primary)]/20 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
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
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(159,84,247,0.4)] p-1.5">
                            <Image
                              src={logoSrc}
                              alt="AI"
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain brightness-0 invert"
                            />
                          </div>
                        )}
                        <motion.div
                          layout
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4.5 py-3.5 text-sm leading-relaxed",
                            isUser
                              ? "rounded-tr-md bg-[var(--color-primary)] text-white dark:bg-[var(--color-primary)] dark:text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] font-bold"
                              : "rounded-tl-md border border-black/10 dark:border-[var(--color-primary)]/30 bg-purple-50/95 dark:bg-black/70 text-zinc-950 dark:text-zinc-100 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                          )}
                          whileHover={{ scale: 1.01, y: -1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          {isUser ? (
                            <span className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                              {message.content}
                            </span>
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
                                    <strong className="font-extrabold text-zinc-950 dark:text-[var(--color-primary)]">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="text-zinc-800 dark:text-[var(--color-primary)]/90 font-semibold">
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
                                    <blockquote className="my-2.5 border-l-2 border-zinc-950 dark:border-[var(--color-primary)] pl-3.5 italic text-zinc-800 dark:text-zinc-300 font-medium">
                                      {children}
                                    </blockquote>
                                  ),
                                  code: ({ className, children, ...props }) => {
                                    const isBlock =
                                      className?.includes("language-");
                                    return isBlock ? (
                                      <pre className="my-2.5 overflow-x-auto rounded-xl border border-black/20 dark:border-[var(--color-primary)]/40 bg-black/90 p-3.5 text-xs text-[var(--color-primary)]">
                                        <code {...props}>{children}</code>
                                      </pre>
                                    ) : (
                                      <code
                                        className="rounded bg-black/15 dark:bg-black/60 border border-black/10 dark:border-[var(--color-primary)]/40 px-1.5 py-0.5 text-xs font-bold text-zinc-950 dark:text-[var(--color-primary)]"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                  table: ({ children }) => (
                                    <div className="my-2.5 overflow-x-auto rounded-lg border border-black/15 dark:border-[var(--color-primary)]/40">
                                      <table className="w-full text-left text-xs">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="border-b border-black/15 dark:border-[var(--color-primary)]/40 bg-purple-200/80 dark:bg-[var(--color-surface)] p-2.5 font-bold text-zinc-950 dark:text-white">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="border-b border-black/10 dark:border-[var(--color-primary)]/20 p-2.5 text-zinc-900 dark:text-zinc-200">
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
            <div className="relative z-10 shrink-0 border-t border-black/10 dark:border-[var(--color-primary)]/20 p-3.5 bg-purple-50/80 dark:bg-black/75 backdrop-blur-md">
              <div className="flex items-center gap-2 rounded-2xl border-1 border-black/20 dark:border-[var(--color-primary)]/40 bg-white dark:bg-[var(--color-surface)] px-4 py-2 focus-within:border-[var(--color-primary)] dark:focus-within:border-[var(--color-primary)] transition-all">
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
                      ? "bg-[var(--color-primary)] text-white dark:bg-[var(--color-primary)] dark:text-white shadow-md hover:brightness-110"
                      : "bg-black/15 text-zinc-600 dark:bg-white/10 dark:text-zinc-500 cursor-not-allowed",
                  )}
                >
                  <Send className="size-4.5" />
                </motion.button>
              </div>
              <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-300 font-medium">
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
