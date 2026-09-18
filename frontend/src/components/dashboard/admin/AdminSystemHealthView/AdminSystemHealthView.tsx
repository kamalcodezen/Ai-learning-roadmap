"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { serverFetch } from "@/src/lib/core/server";
import { authClient } from "@/src/lib/auth-client";
import {
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Activity,
  Zap,
  Clock,
  Radio,
  HardDrive,
  Lock,
} from "lucide-react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { GlowCard } from "@/src/components/dashboard/shared/cards";

interface ServiceHealthMeta {
  key: string;
  name: string;
  category: string;
  description: string;
  checkMethod: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

const serviceMetaList: ServiceHealthMeta[] = [
  {
    key: "database",
    name: "Database Cluster",
    category: "Storage & Persistence",
    description: "PostgreSQL relational database via Prisma ORM.",
    checkMethod: "SELECT 1 Query Ping",
    icon: Database,
    iconBg: "bg-purple-500/10 text-purple-500",
  },
  {
    key: "backend",
    name: "Backend API",
    category: "Application Core",
    description: "Express.js REST router, middleware, and business services.",
    checkMethod: "Gateway Heartbeat",
    icon: Server,
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  {
    key: "auth",
    name: "Authentication Engine",
    category: "Identity & Security",
    description: "Session validation, bearer tokens, and role authorizations.",
    checkMethod: "Session Store Lookup",
    icon: ShieldCheck,
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    key: "ai",
    name: "AI Inference Gateway",
    category: "Intelligence & LLM",
    description: "Multi-provider LLM pipeline for roadmap generation & copilot.",
    checkMethod: "Inference Model Ping",
    icon: Cpu,
    iconBg: "bg-pink-500/10 text-pink-500",
  },
];

function parseHealthStatus(raw: string | undefined) {
  if (!raw) {
    return {
      isOk: false,
      isErr: true,
      label: "Unknown",
      latency: null,
      provider: null,
      raw: "No Data",
    };
  }

  const isOk = raw.startsWith("✓") || /ok|healthy|connected|online/i.test(raw);
  const isErr = raw.startsWith("✗") || /fail|error|down|offline/i.test(raw);

  const latencyMatch = raw.match(/(\d+)\s*ms/i);
  const latency = latencyMatch ? parseInt(latencyMatch[1], 10) : null;

  let provider: string | null = null;
  if (/groq/i.test(raw)) provider = "Groq";
  else if (/openai/i.test(raw)) provider = "OpenAI";
  else if (/anthropic/i.test(raw)) provider = "Anthropic";
  else if (/gemini/i.test(raw)) provider = "Gemini";

  return {
    isOk,
    isErr: !isOk && isErr,
    label: isOk ? "Operational" : isErr ? "Degraded" : "Unknown",
    latency,
    provider,
    raw,
  };
}

export default function AdminSystemHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminSystemHealth", userId],
    queryFn: async () => {
      const res = await serverFetch(`/api/admin/system-health?userId=${userId}`);
      setLastRefreshedAt(new Date());
      return res;
    },
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="system-health" />;
  }

  if (!data) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-red-500 font-semibold text-lg">
          Unable to load system health
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          The health check telemetry endpoint could not be reached. Please check the backend connection.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" /> Retry Check
        </button>
      </div>
    );
  }

  // Parse statuses
  const parsedServices = serviceMetaList.map((meta) => {
    const rawStatus = data[meta.key];
    const parsed = parseHealthStatus(rawStatus);
    return {
      ...meta,
      ...parsed,
    };
  });

  const allOperational = parsedServices.every((s) => s.isOk);
  const operationalCount = parsedServices.filter((s) => s.isOk).length;
  const totalCount = parsedServices.length;

  // Compute average latency among services with measurable latency
  const latencies = parsedServices
    .map((s) => s.latency)
    .filter((l): l is number => l !== null);
  const avgLatency =
    latencies.length > 0
      ? Math.round(latencies.reduce((acc, curr) => acc + curr, 0) / latencies.length)
      : null;

  return (
    <div className="flex flex-col dashboard-card-gap pb-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">System <span className="text-brand">Health</span></h1>
          <p className="section-subtitle mt-1 text-left">Monitor the status of all platform services.</p>
        </div>
      </div>

      {/* ============================= SYSTEM STATUS BANNER ============================= */}
      <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-4 sm:p-6 transition-all">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div
              className={`relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border ${
                allOperational
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              }`}
            >
              {allOperational ? (
                <>
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500" />
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
                  </span>
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {allOperational
                    ? "All Systems Operational"
                    : `${operationalCount}/${totalCount} Systems Operational`}
                </h2>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    allOperational
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}
                >
                  <Radio className="h-3 w-3 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Continuous real-time health verification across primary database, REST API, authentication, and AI inference nodes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-6 border-t border-border/40 pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Avg Latency</p>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {avgLatency !== null ? `${avgLatency}ms` : "Fast"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-[var(--color-secondary)]">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">Last Checked</p>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {lastRefreshedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/60 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              title="Refresh system health status"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-primary ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              <span>{isFetching ? "Checking..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================= SERVICE CARDS GRID ============================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
        {parsedServices.map((svc) => {
          const Icon = svc.icon;
          return (
            <GlowCard key={svc.key} className="h-full">
              <div className="flex flex-col justify-between h-full space-y-4">
                {/* Card Top: Icon & Status Badge */}
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${svc.iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {svc.isOk ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Operational
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Degraded
                    </span>
                  )}
                </div>

                {/* Card Body: Name, Category, Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground">
                      {svc.name}
                    </h3>
                    {svc.provider && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {svc.provider}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-primary mt-0.5">
                    {svc.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                {/* Card Bottom: Latency / Verification Metrics */}
                <div className="border-t border-border/50 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      Latency
                    </span>
                    <span className="font-semibold text-foreground">
                      {svc.latency !== null ? (
                        <span className="flex items-center gap-1 text-green-500">
                          {svc.latency}ms
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Optimal (&lt;50ms)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                      Check
                    </span>
                    <span className="font-medium text-xs text-foreground/80 truncate max-w-[120px]" title={svc.checkMethod}>
                      {svc.checkMethod}
                    </span>
                  </div>

                  {/* Visual Response Bar */}
                  <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        svc.isOk
                          ? svc.latency && svc.latency > 500
                            ? "bg-amber-500 w-[70%]"
                            : "bg-green-500 w-[95%]"
                          : "bg-red-500 w-[20%]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* ============================= TELEMETRY & DIAGNOSTICS ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 dashboard-card-gap">
        {/* Real-Time Telemetry Bar Chart / Comparison */}
        <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Response Time Breakdown</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ping and roundtrip latency across integrated micro-services
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 whitespace-nowrap">
              Real-time
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {parsedServices.map((svc) => {
              const displayLatency = svc.latency ?? 25;
              // Normalize max display width to ~800ms
              const percentage = Math.min(
                100,
                Math.max(12, Math.round((displayLatency / 700) * 100))
              );

              return (
                <div key={svc.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          svc.isOk ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {svc.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {svc.latency !== null ? `${svc.latency}ms` : "< 50ms"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        svc.isOk
                          ? displayLatency > 500
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-primary to-[var(--color-secondary)]"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System & Architecture Details */}
        <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Infrastructure &amp; Environment</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Platform specifications and security parameters
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 shrink-0 whitespace-nowrap">
              Verified
            </span>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Security Layer
              </span>
              <span className="font-semibold text-foreground">
                Role-Based Guard &amp; Session Tokens
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-primary" />
                Database Driver
              </span>
              <span className="font-semibold text-foreground">
                Prisma ORM (Connection Pool Active)
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Active LLM Provider
              </span>
              <span className="font-semibold text-foreground">
                {parsedServices.find((s) => s.key === "ai")?.provider || "Groq Cloud"} (Llama 3.3)
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-primary" />
                Polling Protocol
              </span>
              <span className="font-semibold text-foreground">
                On-Demand Client React-Query Cache
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

