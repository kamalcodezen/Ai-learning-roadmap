"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getCareerAlignment, type AlignmentData } from "@/src/lib/api/learner/career-alignment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import {
  DashboardButton,
  StatusBadge,
} from "@/src/components/dashboard/shared/patterns";
import { CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  CheckCircle2,
  Target,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Compass,
  CircleDot,
  RefreshCw,
} from "lucide-react";

const importanceTone = {
  High: "red",
  Medium: "orange",
  Low: "blue",
} as const;

const statusBadges = {
  acquired: { label: "Strong Match", tone: "green" },
  learning: { label: "Developing", tone: "blue" },
  missing: { label: "Missing", tone: "red" },
} as const;

function alignmentMeta(pct: number) {
  if (pct >= 80)
    return {
      tone: "green" as const,
      label: "Job Ready",
      color: "#10b981",
    };
  if (pct >= 60)
    return {
      tone: "blue" as const,
      label: "On Track",
      color: "#3b82f6",
    };
  if (pct >= 40)
    return {
      tone: "orange" as const,
      label: "Developing",
      color: "#f59e0b",
    };
  return {
    tone: "red" as const,
    label: "Needs Focus",
    color: "#ef4444",
  };
}

const skillSections = (data: AlignmentData) => [
  {
    title: "Strong Match",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    tone: "green" as const,
    skills: data.strongSkills,
    empty: "None yet — complete milestones to acquire skills.",
  },
  {
    title: "Developing",
    icon: <CircleDot className="w-5 h-5 text-blue-400" />,
    tone: "blue" as const,
    skills: data.developingSkills,
    empty: "None in progress.",
  },
  {
    title: "Missing Skills",
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    tone: "orange" as const,
    skills: data.missingSkills,
    empty: "None missing.",
  },
  {
    title: "Critical Gaps",
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    tone: "red" as const,
    skills: data.criticalGaps,
    empty: "No critical gaps.",
  },
];

export default function CareerAlignmentPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const queryClient = useQueryClient();
  const [seniority, setSeniority] = useState<"junior" | "mid" | "senior">("junior");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["careerAlignment", session?.user?.id],
    queryFn: () => getCareerAlignment(),
    enabled: !!session?.user?.id,
    refetchInterval: 12000,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Sync seniority default from API response without triggering cascading renders
  const effectiveSeniority: "junior" | "mid" | "senior" =
    seniority !== "junior"
      ? seniority
      : (data?.defaultSeniority as "junior" | "mid" | "senior" | undefined) ?? seniority;

  const handleSync = async () => {
    await queryClient.invalidateQueries({ queryKey: ["careerAlignment"] });
    refetch();
  };

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  if (isLoading) {
    return <GenericPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Error Loading Career Alignment</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Failed to load real-time career alignment metrics. Please refresh and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (data.targetRole === "NO_TARGET_ROLE") {
    return (
      <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Career Alignment</h1>
            <p className="text-muted-foreground text-sm">
              See how your current skills match up against your target role requirements.
            </p>
          </div>
        </div>

        <DashboardCard className="max-w-xl mx-auto mt-10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-60" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No Target Role Set</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Complete your onboarding assessment to set your target role and unlock your custom alignment radar.
            </p>
            <DashboardButton href={data.href} text={data.nextAction} size="lg" />
          </CardContent>
        </DashboardCard>
      </div>
    );
  }

  const matchScore =
    effectiveSeniority === "junior"
      ? (data.seniorityBenchmarks?.junior ?? Math.min(100, Math.round(data.matchPercentage * 1.15)))
      : effectiveSeniority === "senior"
        ? (data.seniorityBenchmarks?.senior ?? Math.round(data.matchPercentage * 0.85))
        : (data.seniorityBenchmarks?.mid ?? data.matchPercentage);

  const meta = alignmentMeta(matchScore);
  const totalRequired = data.requirements.length;

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      {/* Page Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Career Alignment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See how your current skills match up against your target role requirements.
          </p>
        </div>

        {/* Live sync controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync Active</span>
          </div>

          <button
            onClick={handleSync}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-card text-xs font-semibold text-foreground transition-all hover:border-border/80 disabled:opacity-50"
            title="Refresh latest career alignment"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* Hero: match ring + target role + next action */}
      <DashboardCard className="border-primary/20">
        <CardContent className="flex flex-col lg:flex-row items-center gap-8 p-6 sm:p-8">
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div className="space-y-1.5">
              <p className="text-xs text-primary uppercase tracking-wider font-bold">
                Target Role
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {data.targetRole}
              </h2>
              {data.roleDescription && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {data.roleDescription}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 justify-center lg:justify-start">
              <StatusBadge tone={meta.tone} icon={<Target className="w-3.5 h-3.5" />}>
                {meta.label}
              </StatusBadge>
              <StatusBadge tone="purple">
                {data.strongSkills.length} strong · {data.developingSkills.length} developing
              </StatusBadge>
              {data.criticalGaps.length > 0 && (
                <StatusBadge tone="red" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  {data.criticalGaps.length} critical gap{data.criticalGaps.length === 1 ? "" : "s"}
                </StatusBadge>
              )}
            </div>

            {/* Seniority Selector */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 justify-center lg:justify-start">
              <span className="text-xs text-muted-foreground font-medium">Benchmark Level:</span>
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
                <button
                  type="button"
                  onClick={() => setSeniority("junior")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    effectiveSeniority === "junior" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Junior
                </button>
                <button
                  type="button"
                  onClick={() => setSeniority("mid")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    effectiveSeniority === "mid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mid-Level
                </button>
                <button
                  type="button"
                  onClick={() => setSeniority("senior")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    effectiveSeniority === "senior" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Senior
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              Baseline computed against {totalRequired} required skill{totalRequired === 1 ? "" : "s"} calibrated for {effectiveSeniority} level expectations.
            </p>

            <div className="pt-1">
              <DashboardButton
                href={data.href}
                text={
                  <span className="flex items-center gap-2">
                    {data.nextAction} <ArrowRight className="w-4 h-4" />
                  </span>
                }
                size="lg"
              />
            </div>
          </div>

          {/* Circular Match Gauge */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="alignment-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9F54F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <path
                  className="text-primary/15"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                />
                <path
                  stroke="url(#alignment-ring)"
                  strokeDasharray={`${matchScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground">
                  {matchScore}%
                </span>
                <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Match
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </DashboardCard>

      {/* Skill Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        {skillSections(data).map((section) => (
          <DashboardCard key={section.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                {section.icon} {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {section.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-semibold shadow-sm hover:border-primary/40 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{section.empty}</p>
              )}
              {section.tone === "red" && section.skills.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Critical gaps block your match score the most — prioritize these skills first.
                </p>
              )}
            </CardContent>
          </DashboardCard>
        ))}
      </div>

      {/* Detailed Requirements with Score Verification */}
      <DashboardCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-base font-bold">
            <Compass className="w-5 h-5" /> Detailed Requirements & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60 rounded-xl border border-border overflow-hidden">
            {data.requirements.map((req, idx) => (
              <div
                key={req.skill + idx}
                className="flex items-center flex-wrap justify-between gap-4 p-4 bg-card/40 hover:bg-card/70 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <span className="font-bold text-sm text-foreground">
                    {req.skill}
                  </span>
                  {req.score !== undefined && req.score > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Score: {req.score}%</span>
                      {req.knowledgeScore !== undefined && req.knowledgeScore > 0 && (
                        <span>• Knowledge: {req.knowledgeScore}%</span>
                      )}
                      {req.practiceScore !== undefined && req.practiceScore > 0 && (
                        <span>• Practice: {req.practiceScore}%</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <StatusBadge tone={importanceTone[req.importance]}>
                    {req.importance} Priority
                  </StatusBadge>
                  <StatusBadge
                    tone={statusBadges[req.status].tone}
                    icon={
                      req.status === "acquired" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : req.status === "learning" ? (
                        <CircleDot className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {statusBadges[req.status].label}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DashboardCard>

      {/* Strategic Recommendations */}
      <DashboardCard className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-base font-bold">
            <Lightbulb className="w-5 h-5" /> Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </DashboardCard>
    </div>
  );
}