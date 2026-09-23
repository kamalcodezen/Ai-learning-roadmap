"use client";

import { useState } from "react";
import { PageHeader, DashboardButton } from "@/src/components/dashboard/shared/patterns";
import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getAssessments } from "@/src/lib/api/learner/assessments";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  Trophy,
  Target,
  ArrowRight,
  RefreshCw,
  Award,
  Sparkles,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import Link from "next/link";

type TabType = "all" | "completed" | "skill_test" | "diagnostic" | "interview";

export default function AssessmentsPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["assessments", session?.user?.id],
    queryFn: () => getAssessments(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 5, // 5s fresh
    refetchInterval: 12000, // 12s live real-time synchronization
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

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
        <h3 className="text-xl font-bold text-destructive">Unable to Load Assessments</h3>
        <p className="text-muted-foreground">Failed to synchronize live assessment data. Please try again.</p>
        <DashboardButton text="Retry Sync" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> In Progress
          </span>
        );
      case "not_started":
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Not Started
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "diagnostic":
        return "DIAGNOSTIC";
      case "interview":
        return "MOCK INTERVIEW";
      case "skill_test":
      default:
        return "SKILL TEST";
    }
  };

  // Filter evaluations based on active tab
  const filteredAssessments = data.assessments.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return item.status === "completed";
    if (activeTab === "diagnostic") return item.type === "diagnostic";
    if (activeTab === "skill_test") return item.type === "skill_test";
    if (activeTab === "interview") return item.type === "interview";
    return true;
  });

  const completedItems = data.assessments.filter((a) => a.status === "completed");
  const diagnosticItems = data.assessments.filter((a) => a.type === "diagnostic");
  const skillTestItems = data.assessments.filter((a) => a.type === "skill_test");
  const interviewItems = data.assessments.filter((a) => a.type === "interview");

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      {/* Top Header with Live Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Assessments"
          description="Manage your evaluations, diagnostics, and skill tests in real time."
        />

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium text-muted-foreground shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Sync</span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh assessments data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isFetching ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
        <Card className="border-primary/20 dashboard-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-primary">
                {data.completedCount}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                Completed Tests
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-foreground">
                {data.averageScore}%
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                Average Score
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
                {data.passedCount ?? completedItems.filter((i) => (i.score ?? 0) >= 70).length}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                Passed (≥ 70%)
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-foreground truncate max-w-[170px]" title={data.targetRole || "Target Career"}>
                {data.targetRole || "Full Stack Dev"}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                Active Target Role
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Target className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Section Header */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Your Evaluations
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({data.assessments.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({completedItems.length})
            </button>
            <button
              onClick={() => setActiveTab("skill_test")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "skill_test"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Skill Tests ({skillTestItems.length})
            </button>
            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "diagnostic"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Diagnostics ({diagnosticItems.length})
            </button>
            {interviewItems.length > 0 && (
              <button
                onClick={() => setActiveTab("interview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "interview"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                Interviews ({interviewItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Evaluations Grid */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center border-2 border-dashed border-border flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Evaluations in this Tab</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Try switching tabs or start a targeted skill mastery check to record new test benchmarks.
            </p>
            <DashboardButton
              text="View All Evaluations"
              radius="lg"
              onClick={() => setActiveTab("all")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 dashboard-card-gap">
            {filteredAssessments.map((assessment) => (
              <DashboardCard
                key={assessment.id}
                className="flex flex-col h-full transition-all hover:border-primary/40 dashboard-card p-0"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Top Metadata Row */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(assessment.status)}
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                          {getTypeLabel(assessment.type)}
                        </span>
                        {assessment.attemptLabel && (
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                            {assessment.attemptLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-foreground leading-snug pt-1">
                        {assessment.title}
                      </h3>

                      {assessment.skillAssociated && (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary/90">
                          <Target className="w-4 h-4 text-primary" />
                          <span>{assessment.skillAssociated}</span>
                        </div>
                      )}

                      {assessment.completedAt && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Completed: {assessment.completedAt}</span>
                        </div>
                      )}
                    </div>

                    {assessment.score !== undefined && (
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`text-2xl font-black ${
                            assessment.score >= 70
                              ? "text-emerald-500 dark:text-emerald-400"
                              : "text-amber-500 dark:text-amber-400"
                          }`}
                        >
                          {assessment.score}%
                        </span>
                        <span className="text-xs uppercase font-bold text-muted-foreground">
                          Score
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                    {assessment.description}
                  </p>

                  {/* Footer & Action Button */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary/70" />
                      <span>{assessment.duration || "4 Stages • ~10m"}</span>
                    </div>

                    {assessment.status === "completed" ? (
                      <Link
                        href={assessment.href}
                        className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border"
                      >
                        Review Results <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      </Link>
                    ) : (
                      <Link
                        href={assessment.href}
                        className="btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        {assessment.status === "in_progress" ? "Continue" : "Start Now"}
                        <PlayCircle className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </DashboardCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
