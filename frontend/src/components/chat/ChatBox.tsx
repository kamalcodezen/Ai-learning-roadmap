"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import brandLogo from "../../../public/brand/logo-p-purple.png"

import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  type ChatMessage,
} from "@/src/lib/api/chat-ai-mentor/chat";
import { authClient } from "@/src/lib/auth-client";
import { Meteors } from "@/src/components/ui/meteors";
import { BorderBeam } from "@/src/components/ui/border-beam";
import Lenis from "lenis";
import Image from "next/image";
import { Mic, MicOff, Volume2, VolumeX, Trash2 } from "lucide-react";
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

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting);
  const glowRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const chatLenisRef = useRef<Lenis | null>(null);
  const hasHydratedRef = useRef(false);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  const handleAutoSubmit = useCallback((spokenText: string) => {
    if (spokenText.trim()) {
      sendMessageRef.current(spokenText);
    }
  }, []);

  const handleTranscriptUpdate = useCallback((transcript: string) => {
    if (transcript) {
      setInput(transcript);
    }
  }, []);

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

  // Fetch persistent conversation history when session is available
  useEffect(() => {
    if (session?.user?.id) {
      getChatHistory()
        .then((history) => {
          if (history && history.length > 0) {
            setMessages(history);
          }
        })
        .catch((err) => console.error("Could not load chat history:", err))
        .finally(() => {
          hasHydratedRef.current = true;
        });
    }
  }, [session?.user?.id]);

  const handleClearChat = useCallback(async () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ai_pather_chat_box_history");
        localStorage.removeItem("ai_pather_floating_chat_history");
      } catch (e) {
        console.error("Error clearing chat localStorage:", e);
      }
    }
    await clearChatHistory();
  }, []);

  const rawName = session?.user?.name?.trim();
  const userName = rawName ? rawName.split(/\s+/)[0] : undefined;
  const greeting = userName ? `${timeGreeting}, ${userName}` : timeGreeting;

  // Auto-scroll the inner chat area after hydration, only when messages/loading change
  useEffect(() => {
    if (!hasHydratedRef.current) return;

    if (chatLenisRef.current) {
      chatLenisRef.current.scrollTo("bottom");
    } else if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Lenis smooth scrolling for the inner chat scroll area
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!chatScrollRef.current || !chatContentRef.current) return;

    const lenis = new Lenis({
      wrapper: chatScrollRef.current,
      content: chatContentRef.current,
      autoRaf: true,
    });

    chatLenisRef.current = lenis;

    return () => {
      chatLenisRef.current = null;
      lenis.destroy();
    };
  }, []);

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

  const sendMessageText = useCallback(
    async (textToSend: string) => {
      const message = textToSend.trim();

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

        console.log(`[AI Copilot] Provider: ${response.data.provider} | Model: ${response.data.model}`);

        const reply = response.data.reply;
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: reply,
        };

        setMessages((previous) => [...previous, assistantMessage]);

        // Speak the AI reply aloud using natural browser speech synthesis
        speakReply(reply);
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
    },
    [isLoading, messages, speakReply]
  );

  useEffect(() => {
    sendMessageRef.current = sendMessageText;
  }, [sendMessageText]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessageText(input);
  };

  return (
    <section
      className="group relative flex h-[75vh] lg:h-[85vh] w-full flex-col rounded-xl border-2 border-[#E6E9EE] dark:border-[rgba(159,84,247,0.15)] transition-all duration-300 bg-background overflow-clip"
      id="dashboard-chatbot"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
      />
      <Meteors number={8} className="bg-primary/30" />
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-2 sm:px-6">
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

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* AI Voice Output Toggle */}
          <button
            type="button"
            onClick={toggleVoiceReply}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border opacity-100 shadow-sm ${
              voiceReplyEnabled
                ? "bg-primary text-white border-primary-foreground/30 shadow-[0_0_12px_rgba(159,84,247,0.5)]"
                : "bg-purple-600/20 text-purple-950 dark:text-purple-200 border-purple-500/40 hover:bg-purple-600/30"
            }`}
            title={voiceReplyEnabled ? "AI Voice Reply is ON (Click to Mute)" : "AI Voice Reply is OFF (Click to Unmute)"}
          >
            {voiceReplyEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-purple-950 dark:text-purple-200" />
            )}
            <span className="hidden xs:inline">
              {voiceReplyEnabled ? "Voice ON" : "Voice OFF"}
            </span>
          </button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => void handleClearChat()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border bg-muted/40 border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
              title="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Clear Chat</span>
            </button>
          )}

          {/* Online Status */}
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(159,84,247,0.8)]" />
            <span className="text-xs text-primary font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 proof-card">
        <div ref={chatContentRef} className="min-h-full min-w-0">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-xl text-center">
              {/* Welcome Icon */}
              <div className="mx-auto mb-4 flex items-center justify-center">
                <Image src={brandLogo} alt="AI Pathar" className="h-11 w-11 object-contain dark:brightness-0 dark:invert" height={44} width={44}/>
              </div>

              {/* Greeting */}
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-6">
                {greeting}
              </h2>

              {/* Feature Suggestions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(session?.user
                  ? [
                      "What is my current milestone and next step?",
                      "Review my active skill gaps and learning debt",
                      "Help me plan a real-world project for my stack",
                      "Start a 5-minute technical mock interview",
                      "Review my ATS resume score",
                      "How can I improve my Job Readiness Score?",
                    ]
                  : [
                      "What is AIPather and how does it work?",
                      "Which tech career track should I start with?",
                      "How does the adaptive roadmap help me?",
                      "How do I get verified proof for my GitHub projects?",
                      "What is the 4-Stage Skill Mastery Simulation?",
                      "How does the 4-Pillar Job Readiness Score work?",
                    ]
                ).map((suggestion) => (
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
          <div className="mx-auto flex max-w-3xl flex-col gap-5 min-w-0 w-full">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex w-full min-w-0 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] min-w-0 rounded-3xl px-4 py-3 text-sm sm:text-base leading-relaxed break-words [overflow-wrap:anywhere] ${
                    message.role === "user"
                      ? "rounded-br-md bg-primary text-white font-medium"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="markdown-content min-w-0 text-sm sm:text-base break-words [overflow-wrap:anywhere]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 mt-1 text-xl sm:text-2xl font-bold text-foreground">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-3 mt-5 text-lg sm:text-xl font-bold text-foreground">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-4 text-base sm:text-lg font-semibold text-foreground">
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p className="mb-3.5 last:mb-0 text-sm sm:text-base leading-relaxed text-foreground/90 font-normal">{children}</p>
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
                            <ul className="mb-4 ml-5 list-disc space-y-1.5 text-sm sm:text-base">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-sm sm:text-base">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li className="pl-1 text-sm sm:text-base leading-relaxed">{children}</li>
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
                                className="rounded bg-primary/10 dark:bg-primary/25 px-1.5 py-0.5 text-xs sm:text-sm font-mono font-semibold text-primary"
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
                              <table className="w-full text-left text-xs sm:text-sm">
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
      </div>

      {/* Input Area */}
      <div className="border-t border-border px-4 py-2 md:p-3">
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-border bg-card py-0 px-2 md:py-2 transition focus-within:border-primary/30"
        >
          <BorderBeam
            duration={6}
            size={100}
            colorFrom="rgba(239,68,68,0)"
            colorTo="#ef4444"
          />
          <BorderBeam
            duration={6}
            delay={3}
            size={100}
            borderWidth={2}
            colorFrom="rgba(59,130,246,0)"
            colorTo="#3b82f6"
          />
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

          {/* Direct Inline Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? "Stop listening" : "Start speaking"}
            title={isListening ? "Listening to your voice... (Click to stop)" : "Click to speak your message"}
            className={`relative flex h-10 w-9 mb-0.5 md:h-11 md:w-11 md:m-0 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer opacity-100 border font-bold shadow-sm ${
              isListening
                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse"
                : isSpeaking
                ? "bg-primary text-white border-primary-foreground/30 shadow-[0_0_12px_rgba(159,84,247,0.8)] animate-pulse"
                : "bg-purple-600/20 text-purple-950 dark:text-purple-200 border-purple-500/40 hover:bg-purple-600/30"
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 md:w-5 md:h-5 text-white" />
            ) : (
              <Mic className="w-4 h-4 md:w-5 md:h-5 text-purple-950 dark:text-purple-200 font-bold" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex h-10 w-9 mb-0.5 -mr-1 md:h-11 md:w-11 md:m-0 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
        </form>

        {/* Disclaimer */}
        {/* <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI Pathar can make mistakes. Verify important information.
        </p> */}
      </div>
    </section>
  );
}
