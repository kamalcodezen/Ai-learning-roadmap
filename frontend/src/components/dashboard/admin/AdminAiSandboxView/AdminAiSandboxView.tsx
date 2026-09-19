"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Sparkles,
  Play,
  Sliders,
  Cpu,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  FileCode,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { getAiSandboxModels, testAiSandboxPrompt } from "@/src/lib/api/admin/ai-sandbox";
import { showToast } from "@/src/components/ui/toast";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";

const PROMPT_TEMPLATES = [
  {
    label: "Roadmap Milestone",
    prompt: "Generate a 3-tier milestone roadmap for a Junior Backend Developer transitioning to Senior Distributed Systems Engineer. Include specific project ideas.",
  },
  {
    label: "Assessment Question",
    prompt: "Create 2 conceptual multiple-choice diagnostic questions on PostgreSQL indexing (B-Tree vs GIN) with detailed explanation of the correct choice.",
  },
  {
    label: "Project Rubric",
    prompt: "Formulate a verification rubric for a full-stack real-time collaborative whiteboard project using WebSockets and Redis pub/sub.",
  },
  {
    label: "Interview Simulation",
    prompt: "Act as an engineering interviewer evaluating a candidate's response to designing an idempotent payment processing webhook handler.",
  },
];

export default function AdminAiSandboxView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [model, setModel] = useState("qwen/qwen3.8-27b");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an AI Curriculum Architect and Career Mentor for the AI Pather platform. Provide structured, concise, actionable, and industry-standard guidance."
  );
  const [prompt, setPrompt] = useState(PROMPT_TEMPLATES[0].prompt);
  const [copied, setCopied] = useState(false);

  const { data: modelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["aiSandboxModels", userId],
    queryFn: () => getAiSandboxModels(userId!),
    enabled: !!userId,
  });

  const testMutation = useMutation({
    mutationFn: (payload: {
      prompt: string;
      systemPrompt: string;
      model: string;
      temperature: number;
      maxTokens: number;
    }) => testAiSandboxPrompt(userId!, payload),
    onSuccess: (res) => {
      if (res?.isError) {
        showToast({ variant: "error", message: "Model inference returned an error." });
      } else {
        showToast({ variant: "success", message: `Generated in ${res.latency}ms!` });
      }
    },
    onError: (err: Error) => {
      showToast({ variant: "error", message: err.message || "Execution failed." });
    },
  });

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      return showToast({ variant: "error", message: "Please enter a test prompt." });
    }

    testMutation.mutate({
      prompt: prompt.trim(),
      systemPrompt: systemPrompt.trim(),
      model,
      temperature,
      maxTokens,
    });
  };

  const handleCopy = () => {
    if (!testMutation.data?.reply) return;
    navigator.clipboard.writeText(testMutation.data.reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast({ variant: "success", message: "Response copied to clipboard!" });
  };

  if (isModelsLoading) {
    return <AdminPageSkeleton variant="sandbox" />;
  }

  const result = testMutation.data;

  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            AI Prompt &amp; Model <span className="text-brand">Sandbox</span>
          </h1>
          <p className="section-subtitle mt-1 !text-left !mx-0 max-w-none">
            Test LLM prompts, model configurations, and reasoning token telemetry in real-time
          </p>
        </div>
      </div>

      {/* ============================= MODEL PARAMETERS & CONSOLE ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 dashboard-card-gap">
        {/* Left Column: Parameters & Settings */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Model Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tune LLM inference hyperparameters
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Groq API
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  LLM Model Engine
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    {(modelsData?.models || [
                      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
                      { id: "openai/gpt-oss-120b", name: "GPT OSS 120B Reasoning" },
                      { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B" },
                      { id: "openai/gpt-oss-20b", name: "GPT OSS 20B" },
                      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B MoE" },
                      { id: "gemma2-9b-it", name: "Gemma 2 9B IT" },
                    ]).map((m: { id: string; name: string }) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-muted-foreground uppercase tracking-wider">
                    Temperature ({temperature})
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {temperature <= 0.3 ? "Deterministic" : temperature <= 0.8 ? "Balanced" : "Creative"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Max Output Tokens
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2000, 4000].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMaxTokens(t)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        maxTokens === t
                          ? "bg-primary text-white dark:text-black border-primary"
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  System Persona / Instructions
                </label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
                  placeholder="System role..."
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setModel("qwen/qwen3.8-27b");
                  setTemperature(0.7);
                  setMaxTokens(1000);
                  setSystemPrompt("You are an AI Curriculum Architect and Career Mentor for the AI Pather platform. Provide structured, concise, and expert guidance.");
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer pt-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Input & Live Inference Output */}
        <div className="lg:col-span-8 space-y-5">
          {/* Prompt Console Card */}
          <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50 mb-3">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />
                  Prompt Execution Console
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Test reasoning outputs, roadmap structures, and telemetry metrics in real-time
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <FileCode className="h-3 w-3 text-primary" /> Templates:
              </span>
              {PROMPT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  aria-label={`Load template prompt: ${tpl.label}`}
                  onClick={() => setPrompt(tpl.prompt)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleRun} className="space-y-3">
              <textarea
                id="sandbox-prompt-input"
                aria-label="AI Prompt Execution Input"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt instructions for test execution..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-muted-foreground">
                  Target Engine: <strong className="text-foreground">{model}</strong>
                </span>

                <button
                  type="submit"
                  disabled={testMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white dark:text-black shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {testMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Executing Inference...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Run Prompt Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Response Output & Telemetry Card */}
          <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50 mb-4">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  Inference Telemetry &amp; Output
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live token volume, provider ping latency, and model output
                </p>
              </div>

              {result?.reply && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
                  <span>{copied ? "Copied" : "Copy Output"}</span>
                </button>
              )}
            </div>

            {/* Telemetry Stats Bar */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Response Time
                  </span>
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                    <Zap className="h-3.5 w-3.5" />
                    {result.latency}ms
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Total Tokens
                  </span>
                  <span className="text-sm font-bold text-foreground font-poppins mt-0.5 block">
                    {result.tokens?.totalTokens ?? 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Prompt Tokens
                  </span>
                  <span className="text-sm font-bold text-muted-foreground font-poppins mt-0.5 block">
                    {result.tokens?.promptTokens ?? 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Provider Node
                  </span>
                  <span className="text-xs font-bold text-primary truncate mt-0.5 block">
                    {result.provider}
                  </span>
                </div>
              </div>
            )}

            {/* Output Display */}
            <div className="min-h-[160px] max-h-[380px] overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border/50 text-xs leading-relaxed font-mono whitespace-pre-wrap text-foreground">
              {testMutation.isPending ? (
                <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs font-medium">Streaming tokens from {model}...</span>
                </div>
              ) : result?.reply ? (
                result.reply
              ) : (
                <div className="flex flex-col items-center justify-center h-36 gap-1 text-muted-foreground">
                  <Sparkles className="h-6 w-6 text-primary/40" />
                  <span className="text-xs font-medium">Run a prompt test above to view live inference telemetry</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
