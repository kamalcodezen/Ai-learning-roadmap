"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { authClient } from "@/src/lib/auth-client";
import { useChatMentor } from "@/src/hooks/useChatMentor";
import logoSrc from "../../../public/brand/AI-Pather-blue.png";
import brandLogo from "../../../public/brand/logo-p-purple.png";
import { PlasmaTriggerButton } from "./PlasmaTriggerButton";
import { TypingIndicator } from "./TypingIndicator";
import { useInlineVoiceChat } from "../voice-agent";

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

interface HomeFloatingChatProps {
  hideTriggerOnMobile?: boolean;
}

export function HomeFloatingChat({ hideTriggerOnMobile = false }: HomeFloatingChatProps) {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, input, setInput, isLoading, sendMessage, clearChat } = useChatMentor();
  const { data: session } = authClient.useSession();
  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sendMessageRef = useRef<(text?: string) => Promise<void>>(async () => {});

  // Global event listener to open chat from external buttons (e.g. mobile navbar AI Mentor button)
  useEffect(() => {
    const handleOpenChat = () => {
      setOpen(true);
    };
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  const handleAutoSubmit = useCallback((spokenText: string) => {
    if (spokenText.trim()) {
      void sendMessageRef.current(spokenText);
    }
  }, []);

  const handleTranscriptUpdate = useCallback((transcript: string) => {
    if (transcript) {
      setInput(transcript);
    }
  }, [setInput]);

  const {
    isListening,
    isSpeaking,
    voiceReplyEnabled,
    toggleMic,
    speakReply,
    toggleVoiceReply,
  } = useInlineVoiceChat({
    onAutoSubmit: handleAutoSubmit,
    onTranscriptUpdate: handleTranscriptUpdate,
  });

  useEffect(() => {
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

  const handleSendMessage = useCallback(async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isLoading) return;
    const reply = await sendMessage(textToSend);
    if (reply) {
      speakReply(reply);
    }
  }, [input, isLoading, sendMessage, speakReply]);

  useEffect(() => {
    sendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleSendClick = useCallback(() => {
    void handleSendMessage();
  }, [handleSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsExpanded(false);
  };

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      if (!next) setIsExpanded(false);
      return next;
    });
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {open && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-auto font-sans z-50",
          isExpanded
            ? "fixed inset-3 sm:inset-6 md:inset-8 flex flex-col"
            : "fixed bottom-6 right-6 flex flex-col items-end"
        )}
      >
        {/* Plasma Animated Chat Window */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-[#f3e8ff] via-[#ede5ff] to-[#ddd0ff] dark:from-[#0a0015] dark:via-[#120025] dark:to-[#1a0040] text-zinc-950 dark:text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[var(--color-primary)]/40 dark:border-[var(--color-primary)]/30",
                isExpanded
                  ? "w-full h-full max-h-none mb-0"
                  : "mb-3 h-[590px] max-h-[86vh] w-[385px] sm:w-[445px]"
              )}
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

                <div className="flex items-center gap-2">
                  {/* Voice Output Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={toggleVoiceReply}
                    aria-label="Toggle voice output"
                    title={voiceReplyEnabled ? "AI Voice Reply is ON (Click to Mute)" : "AI Voice Reply is OFF (Click to Unmute)"}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border opacity-100 shadow-sm",
                      voiceReplyEnabled
                        ? "bg-[var(--color-primary)] text-white border-white/40 shadow-[0_0_12px_rgba(159,84,247,0.5)]"
                        : "bg-purple-600/20 text-purple-950 dark:text-purple-200 border-purple-500/40 hover:bg-purple-600/30"
                    )}
                  >
                    {voiceReplyEnabled ? (
                      <Volume2 className="size-3.5 text-white" />
                    ) : (
                      <VolumeX className="size-3.5 text-purple-950 dark:text-purple-200" />
                    )}
                    <span className="text-[11px] font-bold hidden xs:inline">
                      {voiceReplyEnabled ? "Voice ON" : "Voice OFF"}
                    </span>
                  </motion.button>

                  {/* Clear Chat Button */}
                  {messages.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => void clearChat()}
                      aria-label="Clear chat history"
                      title="Clear Chat History"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 transition-colors hover:bg-rose-500 hover:text-white cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </motion.button>
                  )}

                  {/* Fullscreen / Expand Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    aria-label={isExpanded ? "Exit Fullscreen" : "Fullscreen"}
                    title={isExpanded ? "Collapse to Window" : "Expand to Fullscreen"}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-zinc-800 dark:text-white transition-colors hover:bg-[var(--color-primary)] hover:text-white cursor-pointer"
                  >
                    {isExpanded ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </motion.button>

                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    aria-label="Close chat"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-zinc-800 dark:text-white transition-colors hover:bg-[var(--color-primary)] hover:text-white cursor-pointer"
                  >
                    <X className="size-5" />
                  </motion.button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={scrollContainerRef}
                tabIndex={0}
                onWheel={(e) => e.stopPropagation()}
                className="relative z-10 min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-3 sm:px-3 sm:py-3.5 outline-none scrollbar-thin scrollbar-thumb-zinc-600/30 dark:scrollbar-thumb-[var(--color-primary)]/40 scrollbar-track-transparent"
              >
                {messages.length === 0 ? (
                  <div className={cn(
                    "flex min-h-full flex-col items-center justify-between text-center p-4 pt-10",
                    isExpanded && "max-w-3xl mx-auto justify-center gap-8 pt-16"
                  )}>
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

                    <div className={cn(
                      "w-full mb-2",
                      isExpanded
                        ? "grid grid-cols-1 sm:grid-cols-3 gap-3"
                        : "flex flex-col gap-2.5"
                    )}>
                      {[
                        "Create my personalized learning roadmap",
                        "Analyze my skills and suggest what to learn",
                        "Help me plan a real-world project",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void handleSendMessage(suggestion)}
                          disabled={isLoading}
                          className="rounded-2xl border border-black/10 dark:border-[var(--color-primary)]/30 bg-purple-100/85 dark:bg-black/40 px-4 py-3 text-left text-sm font-semibold text-zinc-950 dark:text-zinc-100 transition hover:border-black dark:hover:border-[var(--color-primary)] hover:bg-purple-200 dark:hover:bg-[var(--color-primary)]/20 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={cn("space-y-4 w-full min-w-0", isExpanded && "max-w-4xl mx-auto")}>
                    {messages.map((message, index) => {
                      const isUser = message.role === "user";
                      return (
                        <div
                          key={`${message.role}-${index}`}
                          className={cn(
                            "flex w-full min-w-0",
                            isUser ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-start gap-2 min-w-0 w-full",
                              isUser ? "flex-row-reverse ml-auto max-w-[88%]" : "w-full max-w-full",
                            )}
                          >
                            {!isUser && (
                              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(159,84,247,0.4)] p-1.5 mt-0.5">
                                <Image
                                  src={logoSrc}
                                  alt="AI"
                                  width={18}
                                  height={18}
                                  className="h-4 w-4 sm:h-5 sm:w-5 object-contain brightness-0 invert"
                                />
                              </div>
                            )}
                            <div
                              className={cn(
                                "rounded-2xl px-2.5 py-2.5 sm:px-3.5 sm:py-3 text-sm sm:text-base leading-relaxed min-w-0 max-w-full break-words [overflow-wrap:anywhere]",
                                isUser
                                  ? "rounded-tr-md bg-[var(--color-primary)] text-white dark:bg-[var(--color-primary)] dark:text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] font-medium"
                                  : "rounded-tl-md border border-black/10 dark:border-[var(--color-primary)]/30 bg-purple-50/95 dark:bg-black/70 text-zinc-950 dark:text-zinc-100 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex-1 w-full",
                              )}
                            >
                              {isUser ? (
                                <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm sm:text-base leading-relaxed text-white">
                                  {message.content}
                                </span>
                              ) : (
                                <div className="markdown-content max-w-none text-sm sm:text-base leading-relaxed text-zinc-900 dark:text-zinc-100 break-words [overflow-wrap:anywhere]">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      h1: ({ children }) => (
                                        <h1 className="mb-2.5 mt-1 text-lg sm:text-xl font-bold text-zinc-950 dark:text-white break-words">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="mb-2 mt-3 text-base sm:text-lg font-bold text-zinc-950 dark:text-white break-words">
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children }) => (
                                        <h3 className="mb-1.5 mt-2.5 text-sm sm:text-base font-semibold text-zinc-950 dark:text-zinc-100 break-words">
                                          {children}
                                        </h3>
                                      ),
                                      p: ({ children }) => (
                                        <p className="mb-3 last:mb-0 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200 font-normal break-words">
                                          {children}
                                        </p>
                                      ),
                                      strong: ({ children }) => (
                                        <strong className="font-semibold text-zinc-950 dark:text-white">
                                          {children}
                                        </strong>
                                      ),
                                      em: ({ children }) => (
                                        <em className="text-zinc-700 dark:text-zinc-300 italic">
                                          {children}
                                        </em>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="mb-3 ml-4 list-disc space-y-1 text-zinc-800 dark:text-zinc-200 text-sm sm:text-base break-words">
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="mb-3 ml-4 list-decimal space-y-1 text-zinc-800 dark:text-zinc-200 text-sm sm:text-base break-words">
                                          {children}
                                        </ol>
                                      ),
                                      li: ({ children }) => (
                                        <li className="pl-0.5 text-sm sm:text-base leading-relaxed break-words">
                                          {children}
                                        </li>
                                      ),
                                      hr: () => (
                                        <hr className="my-3 border-black/10 dark:border-white/10" />
                                      ),
                                      blockquote: ({ children }) => (
                                        <blockquote className="my-3 border-l-2 border-[var(--color-primary)] pl-3 italic text-zinc-700 dark:text-zinc-300 font-normal break-words">
                                          {children}
                                        </blockquote>
                                      ),
                                      code: ({ className, children, ...props }) => {
                                        const isBlock =
                                          className?.includes("language-");
                                        return isBlock ? (
                                          <pre className="my-3 overflow-x-auto max-w-full rounded-xl border border-black/20 dark:border-[var(--color-primary)]/40 bg-black/90 p-3 text-xs sm:text-sm text-[var(--color-primary)] font-mono whitespace-pre-wrap break-words">
                                            <code {...props}>{children}</code>
                                          </pre>
                                        ) : (
                                          <code
                                            className="rounded bg-primary/10 dark:bg-primary/25 px-1.5 py-0.5 text-xs sm:text-sm font-mono font-semibold text-purple-900 dark:text-purple-300 break-words [overflow-wrap:anywhere]"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      },
                                      table: ({ children }) => (
                                        <div className="my-2.5 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 max-w-full">
                                          <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                            {children}
                                          </table>
                                        </div>
                                      ),
                                      th: ({ children }) => (
                                        <th className="border-b border-black/10 dark:border-white/10 bg-purple-100/60 dark:bg-white/10 p-2 font-semibold text-zinc-950 dark:text-white">
                                          {children}
                                        </th>
                                      ),
                                      td: ({ children }) => (
                                        <td className="border-b border-black/5 dark:border-white/5 p-2 text-zinc-800 dark:text-zinc-200 break-words">
                                          {children}
                                        </td>
                                      ),
                                    }}
                                  >
                                    {message.content ? message.content.replace(/<br\s*\/?>/gi, "\n").replace(/&lt;br\s*\/?&gt;/gi, "\n") : ""}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <AnimatePresence>
                      {isLoading && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(159,84,247,0.4)] p-1.5">
                            <Image
                              src={logoSrc}
                              alt="AI"
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain brightness-0 invert"
                            />
                          </div>
                          <TypingIndicator />
                        </div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

            {/* Input Footer */}
            <div className="relative z-10 shrink-0 border-t border-black/10 dark:border-[var(--color-primary)]/20 p-3.5 bg-purple-50/80 dark:bg-black/75 backdrop-blur-md">
              <div className={cn("w-full", isExpanded && "max-w-4xl mx-auto")}>
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
                  {/* Direct Inline Voice Input Mic Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={toggleMic}
                    aria-label={isListening ? "Stop listening" : "Start speaking"}
                    title={isListening ? "Listening to your voice... (Click to stop)" : "Click to speak your message"}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer opacity-100 border shadow-sm",
                      isListening
                        ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse"
                        : isSpeaking
                        ? "bg-[var(--color-primary)] text-white border-purple-300 shadow-[0_0_12px_rgba(159,84,247,0.8)] animate-pulse"
                        : "bg-purple-600/20 text-purple-950 dark:text-purple-200 border-purple-500/40 hover:bg-purple-600/30"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="size-4.5 text-white" />
                    ) : (
                      <Mic className="size-4.5 text-purple-950 dark:text-purple-200 font-bold" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendClick}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Floating Trigger Button */}
        <div className={cn(hideTriggerOnMobile && "hidden lg:block")}>
          <PlasmaTriggerButton
            size={60}
            logo={logoSrc}
            isOpen={open}
            onClick={toggleOpen}
          />
        </div>
      </div>
    </>
  );
}
