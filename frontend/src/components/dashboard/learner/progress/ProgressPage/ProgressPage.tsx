"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getProgress, type ActivityItem } from "@/src/lib/api/learner/progress";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import { CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardCard, KpiCard } from "@/src/components/dashboard/shared/cards";
import {
  Clock,
  Calendar,
  Flame,
  TrendingUp,
  BookOpen,
  FileCode,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Target,
  Award,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

export default function ProgressPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["progress", session?.user?.id],
    queryFn: () => getProgress(),
    enabled: !!session?.user?.id,
    refetchInterval: 12000,
    staleTime: 5000,
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
        <h3 className="text-xl font-bold text-destructive">Error Loading Progress</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Unable to fetch real-time learning metrics. Please check your connection and retry.
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

  const getActivityBadge = (item: ActivityItem) => {
    switch (item.category) {
      case "Simulation":
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          nodeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          label: "Simulation",
        };
      case "Diagnostic":
        return {
          icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          nodeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          label: "Diagnostic",
        };
      case "Interview":
        return {
          icon: <Activity className="w-4 h-4 text-blue-400" />,
          badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          nodeBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          label: "Interview",
        };
      case "Project":
        return {
          icon: <FileCode className="w-4 h-4 text-amber-400" />,
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          nodeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          label: "Project",
        };
      case "Milestone":
        return {
          icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
          badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          nodeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          label: "Milestone",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-primary" />,
          badgeClass: "bg-primary/10 text-primary border-primary/20",
          nodeBg: "bg-primary/10 border-primary/30 text-primary",
          label: "Activity",
        };
    }
  };

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      {/* Page Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Progress Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your learning hours, streaks, skill mastery, and live timeline.
          </p>
        </div>

        {/* Live sync controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Real-Time Sync</span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-card text-xs font-semibold text-foreground transition-all hover:border-border/80 disabled:opacity-50"
            title="Refresh latest progress data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
        <KpiCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This Week</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{data.weeklyHours}h</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">Last 7 days of active effort</span>
        </KpiCard>

        <KpiCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This Month</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{data.monthlyHours}h</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">30-day cumulative progress</span>
        </KpiCard>

        <KpiCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{data.currentStreak}</span>
            <span className="text-sm font-semibold text-muted-foreground">Days</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">Consecutive learning activity</span>
        </KpiCard>

        <KpiCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Readiness Trend</span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-400">
              +{data.readinessTrend}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">Target role competence gain</span>
        </KpiCard>
      </div>

      {/* Summary Banner */}
      {data.summary && (
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Target Track</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium text-white">
                  {data.targetRole || data.summary.targetRole}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {data.summary.completedMilestones > 0
                  ? `${data.summary.completedMilestones} of ${data.summary.totalMilestones || 14} Milestones Completed`
                  : "Curriculum roadmap initialized & active"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{data.summary.completedMilestones} Milestones</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{data.summary.completedProjects} Projects</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.summary.completedAssessments + data.summary.completedInterviews} Verified Evaluations</span>
            </div>
            {data.summary.totalXp > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Zap className="w-3.5 h-3.5" />
                <span>{data.summary.totalXp} Total XP</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Breakdown Grid (if skills exist) */}
      {data.skills && data.skills.length > 0 && (
        <DashboardCard>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Skill Competency Breakdown</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live verification across Knowledge, Practice simulations, and Project evidence.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-white">
              {data.skills.length} Competencies
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-colors flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-foreground">{skill.name}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white ${
                          skill.score >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : skill.score >= 50
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <span className="text-base font-bold text-foreground">{skill.score}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.score >= 80
                          ? "bg-emerald-500"
                          : skill.score >= 50
                            ? "bg-primary"
                            : "bg-muted-foreground/60"
                      }`}
                      style={{ width: `${Math.max(4, Math.min(100, skill.score))}%` }}
                    />
                  </div>

                  {/* Micro Breakdown */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-1 border-t border-border/40">
                    <span>Knowledge: {skill.knowledge}%</span>
                    <span>Practice: {skill.practice}%</span>
                    <span>Projects: {skill.project}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </DashboardCard>
      )}

      {/* Unified Activity Feed Timeline */}
      <DashboardCard>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Recent Activity Feed</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Chronological log of your assessments, simulations, projects, and milestone progress.
            </p>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {data.recentActivity.length} Events Recorded
          </span>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mb-3 opacity-40 text-muted-foreground" />
              <p className="font-semibold text-base text-foreground">No Activity Recorded Yet</p>
              <p className="text-sm max-w-md mt-1 text-muted-foreground">
                Complete diagnostic assessments, interactive skill simulations, or roadmap milestones to build your streak and track learning progress.
              </p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/60 before:to-transparent">
              {data.recentActivity.map((activity) => {
                const badge = getActivityBadge(activity);
                return (
                  <div key={activity.id} className="relative flex items-start gap-4 group">
                    {/* Node Icon */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 relative z-10 shadow-sm transition-transform group-hover:scale-105 ${badge.nodeBg}`}
                    >
                      {badge.icon}
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-all shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-foreground">{activity.title}</h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                          {activity.score !== null && activity.score !== undefined && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Score: {activity.score}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <time className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {activity.formattedDate || activity.date}
                          </time>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </DashboardCard>
    </div>
  );
}
