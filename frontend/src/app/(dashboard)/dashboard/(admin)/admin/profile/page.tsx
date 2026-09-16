"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  MapPin,
  Mail,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Activity,
  Cpu,
  FileText,
  Route,
  ArrowRight,
  Zap,
  Megaphone,
} from "lucide-react";
import { getAdminDashboardStats } from "@/src/lib/api/admin/dashboard";
import { authClient } from "@/src/lib/auth-client";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";
import DashboardProfile from "@/src/components/dashboard/shared/profile/DashboardProfile";
import type { ProfileChart } from "@/src/components/dashboard/shared/profile/DashboardProfile";
import { GlowCard } from "@/src/components/dashboard/shared/cards";

const COVER_IMAGE = "/images/Company_welcome.jpeg";

/**
 * Admin Profile & Management Overview Page.
 * Displays administrative credentials, live subsystem health, learner activity, and the 6-card Operations Hub.
 */
export default function AdminProfilePage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard", userId],
    queryFn: () => getAdminDashboardStats(userId!),
    enabled: !!userId,
  });

  const quickMetrics = useMemo(() => {
    if (!data) return [];
    const o = data.overview;
    return [
      { label: "Active Learners", value: String(o.activeLearners ?? 0) },
      { label: "Roadmaps", value: String(o.totalRoadmaps ?? 0) },
      { label: "Projects", value: String(o.totalProjects ?? 0) },
      { label: "AI Requests", value: String(o.aiRequests ?? 0) },
    ];
  }, [data]);

  const chart: ProfileChart | undefined = useMemo(() => {
    if (!data) return undefined;
    const ua = data.userAnalytics;
    const grouped = [
      { name: "Learners", value: ua?.learners ?? 0 },
      { name: "Admins", value: ua?.admins ?? 0 },
      { name: "New Users", value: ua?.newUsers ?? 0 },
    ];
    return {
      title: "Platform Insights",
      subtitle: "Account distribution and platform analytics feed",
      data: grouped,
      xKey: "name",
      yKey: "value",
    };
  }, [data]);

  if (isSessionLoading || isLoading) {
    return <GenericPageSkeleton />;
  }

  const email = session?.user?.email || "admin@aipather.com";

  return (
    <DashboardProfile
      coverImage={COVER_IMAGE}
      roleLabel="Admin"
      bio="Managing the platform, one milestone at a time."
      metaItems={[
        { icon: Briefcase, label: "Platform Admin" },
        { icon: MapPin, label: "AI Pather" },
        { icon: Calendar, label: "Joined 2026" },
      ]}
      introItems={[
        {
          icon: <Mail className="h-4 w-4" />,
          label: "Email Address",
          value: email,
        },
        {
          icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
          label: "Active Status",
          value: (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Super Admin
            </span>
          ),
        },
        {
          icon: <KeyRound className="h-4 w-4 text-primary" />,
          label: "Access Level",
          value: "Full RBAC Management",
        },
        {
          icon: <Sparkles className="h-4 w-4 text-[var(--color-secondary)]" />,
          label: "AI Orchestration",
          value: "Active Multi-Model Routing",
        },
      ]}
      quickMetrics={quickMetrics}
      chart={chart}
      leftColumnExtra={
        <GlowCard corner="bottom-left">
          <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
            <div>
              <h3 className="text-base font-bold font-poppins text-foreground tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Infrastructure &amp; Services
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live operational health across core subsystems
              </p>
            </div>
            <Link
              href="/dashboard/admin/system-health"
              className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
            >
              Health Check <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                PostgreSQL Database
              </span>
              <span className="font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                REST Backend API
              </span>
              <span className="font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Groq AI Inference
              </span>
              <span className="font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                Active &amp; Ready
              </span>
            </div>
          </div>
        </GlowCard>
      }
      rightColumnExtra={
        <>
          <GlowCard corner="bottom-right">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground tracking-tight flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent Platform Activity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time operational events and audit log stream
                </p>
              </div>
              <Link
                href="/dashboard/admin/activity"
                className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {!data?.recentActivity || data.recentActivity.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No recent activity recorded.
                </div>
              ) : (
                data.recentActivity.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-foreground">
                          {act.type}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground font-medium">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                        {act.description || act.user?.name || act.user?.email || "System Event"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlowCard>

          <GlowCard corner="bottom-right">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground tracking-tight flex items-center gap-2">
                  <Route className="h-4 w-4 text-purple-500" />
                  Roadmaps &amp; Milestones
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Curriculum lifecycle and learner progress
                </p>
              </div>
              <Link
                href="/dashboard/admin/roadmaps"
                className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Active Roadmaps
                  </span>
                  <span className="text-lg font-bold text-foreground font-poppins mt-0.5 block">
                    {data?.roadmapManagement?.active ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Completed
                  </span>
                  <span className="text-lg font-bold text-emerald-500 font-poppins mt-0.5 block">
                    {data?.roadmapManagement?.completed ?? 0}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Curriculum Completion Rate</span>
                  <span className="text-foreground font-bold">
                    {data?.roadmapManagement?.totalRoadmaps
                      ? Math.round(
                          ((data.roadmapManagement.completed ?? 0) /
                            data.roadmapManagement.totalRoadmaps) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[var(--color-secondary)] transition-all duration-500"
                    style={{
                      width: `${
                        data?.roadmapManagement?.totalRoadmaps
                          ? Math.min(
                              100,
                              Math.max(
                                8,
                                Math.round(
                                  ((data.roadmapManagement.completed ?? 0) /
                                    data.roadmapManagement.totalRoadmaps) *
                                    100
                                )
                              )
                            )
                          : 15
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </GlowCard>
        </>
      }
    >
      {/* ============================= ADMIN PRIVILEGES & QUICK ACCESS ============================= */}
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Admin Operations &amp; Management Hub
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct access to platform control panels, system health telemetry, and logs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 dashboard-card-gap">
          {/* Card 1: System Health */}
          <Link href="/dashboard/admin/system-health" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    System Health
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Live telemetry &amp; ping checks.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>

          {/* Card 2: AI Playground */}
          <Link href="/dashboard/admin/ai-sandbox" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Playground
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    AI Sandbox
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Test LLM models &amp; latency.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>

          {/* Card 3: Broadcasts */}
          <Link href="/dashboard/admin/broadcasts" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Push
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Broadcasts
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Cohort announcements.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>

          {/* Card 4: AI Usage */}
          <Link href="/dashboard/admin/ai-usage" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 group-hover:scale-105 transition-transform">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    Pipeline
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    AI Usage
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Tokens &amp; provider logs.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>

          {/* Card 5: Audit Logs */}
          <Link href="/dashboard/admin/audit-logs" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Security
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Audit Logs
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Security audit trail.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>

          {/* Card 6: Roadmaps */}
          <Link href="/dashboard/admin/roadmaps" className="group">
            <GlowCard className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform">
                    <Route className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    Curriculum
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Roadmaps
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    Milestones &amp; pathways.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Link>
        </div>
      </div>
    </DashboardProfile>
  );
}

