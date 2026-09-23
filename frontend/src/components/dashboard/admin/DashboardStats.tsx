"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Route,
  ClipboardCheck,
  FolderKanban,
  Sparkles,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  Gem,
  ShieldCheck,
  Megaphone,
  Mic,
  Radio,
  Sliders,
  Cpu,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { getAdminDashboardStats } from "@/src/lib/api/admin/dashboard";
import { authClient } from "@/src/lib/auth-client";
import AdminPageSkeleton from "./shared/AdminPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import DashboardBanner from "@/src/components/dashboard/shared/banner/DashboardBanner/DashboardBanner";

interface Kpi {
  title: string;
  category: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
}

const glowCardClass =
  "group relative overflow-hidden rounded-xl p-5 transition-all duration-300 border border-border/70 hover:border-primary/40 bg-card hover:shadow-[0_8px_30px_rgba(159,84,247,0.08)] proof-card";

export default function DashboardStats() {
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.trim().split(" ")[0] || "Admin";
  const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const userId = session?.user?.id;

  const usersScrollRef = useRef<HTMLDivElement>(null);
  const usersContentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboardStats", userId],
    queryFn: () => getAdminDashboardStats(userId!),
    enabled: !!userId,
  });

  const recentUsers = data?.recentUsers;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!usersScrollRef.current || !usersContentRef.current) return;

    const lenis = new Lenis({
      wrapper: usersScrollRef.current,
      content: usersContentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [recentUsers]);

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="dashboard" />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load dashboard telemetry. Please try again.</p>
      </div>
    );
  }

  const { overview, systemHealth, recentActivity, userAnalytics, roadmapManagement } = data;

  const kpis: Kpi[] = [
    {
      title: "User Population",
      category: "IDENTITY & ACCESS",
      value: overview.totalUsers,
      subtext: `${userAnalytics?.proUsers ?? 0} Pro • ${userAnalytics?.plusUsers ?? 0} Plus • ${userAnalytics?.freeUsers ?? 0} Free`,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
      bgGradient: "from-blue-500/5 to-transparent",
      borderColor: "group-hover:border-blue-500/30",
    },
    {
      title: "Active Learners",
      category: "ENGAGEMENT",
      value: overview.activeLearners,
      subtext: `${Math.round((overview.activeLearners / (overview.totalUsers || 1)) * 100)}% active engagement rate`,
      icon: UserCheck,
      color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
      bgGradient: "from-emerald-500/5 to-transparent",
      borderColor: "group-hover:border-emerald-500/30",
    },
    {
      title: "Gem Treasury Vault",
      category: "INCENTIVE POOL",
      value: `${(overview.totalGemsInCirculation ?? 0).toLocaleString()} 💎`,
      subtext: "Circulating reward economy balance",
      icon: Gem,
      color: "text-amber-500 dark:text-amber-400 bg-amber-500/10",
      bgGradient: "from-amber-500/5 to-transparent",
      borderColor: "group-hover:border-amber-500/30",
    },
    {
      title: "AI Career Roadmaps",
      category: "CURRICULUM",
      value: overview.totalRoadmaps,
      subtext: `${roadmapManagement?.completed ?? 0} completed • ${roadmapManagement?.active ?? 0} in progress`,
      icon: Route,
      color: "text-purple-500 dark:text-purple-400 bg-purple-500/10",
      bgGradient: "from-purple-500/5 to-transparent",
      borderColor: "group-hover:border-purple-500/30",
    },
    {
      title: "Diagnostic Exams",
      category: "SKILL PROOF",
      value: overview.totalAssessments,
      subtext: "Adaptive evaluation instances",
      icon: ClipboardCheck,
      color: "text-indigo-500 dark:text-indigo-400 bg-indigo-500/10",
      bgGradient: "from-indigo-500/5 to-transparent",
      borderColor: "group-hover:border-indigo-500/30",
    },
    {
      title: "Capstone Projects",
      category: "PORTFOLIO",
      value: overview.totalProjects,
      subtext: "Verified real-world builds",
      icon: FolderKanban,
      color: "text-rose-500 dark:text-rose-400 bg-rose-500/10",
      bgGradient: "from-rose-500/5 to-transparent",
      borderColor: "group-hover:border-rose-500/30",
    },
    {
      title: "Mock Interview Runs",
      category: "SIMULATION",
      value: overview.totalInterviews ?? 0,
      subtext: "Speech & technical interview sessions",
      icon: Mic,
      color: "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10",
      bgGradient: "from-cyan-500/5 to-transparent",
      borderColor: "group-hover:border-cyan-500/30",
    },
    {
      title: "AI Resume Profiles",
      category: "CAREER TWIN",
      value: overview.totalResumes ?? 0,
      subtext: "ATS-scored optimized resumes",
      icon: FileText,
      color: "text-teal-500 dark:text-teal-400 bg-teal-500/10",
      bgGradient: "from-teal-500/5 to-transparent",
      borderColor: "group-hover:border-teal-500/30",
    },
    {
      title: "Neural Invocations",
      category: "AI ENGINE",
      value: overview.aiRequests,
      subtext: "Model inference & generation calls",
      icon: Sparkles,
      color: "text-pink-500 dark:text-pink-400 bg-pink-500/10",
      bgGradient: "from-pink-500/5 to-transparent",
      borderColor: "group-hover:border-pink-500/30",
    },
  ];

  const adminBannerStats = [
    {
      value: overview.totalUsers,
      label: "Platform Scale",
      subtext: `${overview.activeLearners} Active Learners enrolled`,
      suffix: "",
    },
    {
      value: overview.aiRequests,
      label: "AI Operations",
      subtext: `${overview.totalResumes ?? 0} Resumes • ${overview.totalInterviews ?? 0} Mocks`,
      suffix: "",
    },
    {
      value: `${(overview.totalGemsInCirculation ?? 0).toLocaleString()} 💎`,
      label: "Circulating Treasury",
      subtext: "Live platform incentive pool",
      suffix: "",
    },
    {
      value: overview.totalRoadmaps,
      label: "Curriculum Engine",
      subtext: `${overview.totalAssessments} Exams • ${overview.totalProjects} Projects`,
      suffix: "",
    },
  ];

  const quickOps = [
    {
      title: "Broadcast Alert",
      desc: "Send push alerts to all learners",
      href: "/dashboard/admin/broadcasts",
      icon: Megaphone,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 hover:bg-amber-500/20",
    },
    {
      title: "User Directory",
      desc: "Inspect roles, cohorts & plans",
      href: "/dashboard/admin/users",
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      title: "Economy Console",
      desc: "Manage streaks & gem treasury",
      href: "/dashboard/admin/gem-economy",
      icon: Gem,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
      title: "AI Playground",
      desc: "Test LLM prompts & token limits",
      href: "/dashboard/admin/ai-sandbox",
      icon: Cpu,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      title: "Audit Matrix",
      desc: "Inspect security logs & actions",
      href: "/dashboard/admin/audit-logs",
      icon: ShieldCheck,
      color: "text-cyan-500 dark:text-cyan-400",
      bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      title: "Adaptive Engine",
      desc: "System health & microservices",
      href: "/dashboard/admin/system-health",
      icon: Sliders,
      color: "text-pink-500 dark:text-pink-400",
      bg: "bg-pink-500/10 hover:bg-pink-500/20",
    },
  ];

  return (
    <div className="flex flex-col dashboard-card-gap pb-6 animate-in fade-in duration-500">
      {/* ============================= WELCOME BANNER ============================= */}
      <DashboardBanner
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>Executive Command Center</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-2.5 py-0.5 text-xs font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SUPER ADMIN
            </span>
          </div>
        }
        subtitle={`Welcome back, ${capitalized}. Platform governance, AI token orchestration & infrastructure telemetry.`}
        stats={adminBannerStats}
        rightSlot={
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-1.5 backdrop-blur-md text-xs font-semibold text-muted-foreground shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              ONLINE
            </div>
            <span className="text-border">|</span>
            <span>SLA 99.98%</span>
            <span className="text-border">|</span>
            <span className="text-primary font-mono text-xs font-bold">PROD</span>
          </div>
        }
      />

      {/* ============================= QUICK OPERATIONS BAR ============================= */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Command Quick Actions
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Instant Control Hub</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {quickOps.map((op) => {
            const Icon = op.icon;
            return (
              <Link
                key={op.title}
                href={op.href}
                className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3.5 transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${op.bg} ${op.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{op.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">{op.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================= GEM ECONOMY SPOTLIGHT BANNER ============================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-purple-500/5 to-transparent p-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-inner mt-0.5 sm:mt-0">
            <Gem className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="font-bold text-foreground text-sm">Gem Economy & Streaks Manager</p>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 whitespace-nowrap">
                {(overview.totalGemsInCirculation ?? 0).toLocaleString()} 💎 in circulation
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live treasury stats, daily streak claim velocity, learner drop-off pipeline, and 1-click encouragement push.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/gem-economy"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
        >
          Open Economy Console
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ============================= CORE TELEMETRY & ECOSYSTEM METRICS ============================= */}
      <section>
        <div className="mb-3.5 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Core Platform Telemetry
            </h2>
            <p className="text-xs text-muted-foreground">
              Multi-dimensional operational telemetry & learner throughput
            </p>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            9 Active Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 dashboard-card-gap">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} mouseGlow className={`${glowCardClass} ${kpi.borderColor}`}>
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-60 transition-opacity group-hover:opacity-100`}
                />
                <CardContent className="relative z-10 flex flex-col justify-between h-full !p-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {kpi.category}
                      </span>
                      <h3 className="text-sm font-bold text-foreground truncate mt-0.5">
                        {kpi.title}
                      </h3>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.color} shadow-inner`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-extrabold tracking-tight text-foreground">
                      {kpi.value}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {kpi.subtext}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============================= HEALTH + RECENT USERS ============================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 dashboard-card-gap">
        {/* System Health */}
        <section className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Infrastructure Telemetry
              </h2>
              <p className="text-xs text-muted-foreground">
                Live microservices status & latency benchmarks
              </p>
            </div>
            <Link
              href="/dashboard/admin/system-health"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors"
            >
              Full Diagnostics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card className={`${glowCardClass} h-[270px] flex flex-col justify-between`}>
            <CardContent className="space-y-3.5 !p-0">
              <HealthRow label="Backend REST / GraphQL API" status={systemHealth.backend} type="API Gateway" />
              <HealthRow label="PostgreSQL & Prisma Engine" status={systemHealth.database} type="Database Cluster" />
              <HealthRow label="Better Auth Session Validator" status={systemHealth.auth} type="Auth & RBAC" />
              <HealthRow label="AI LLM Inference Gateways" status={systemHealth.ai} type="Neural Pipeline" />
            </CardContent>

            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Cluster Healthy
              </span>
              <span className="font-mono text-xs font-medium">Heartbeat: 30s interval</span>
            </div>
          </Card>
        </section>

        {/* Recent Users */}
        <section className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                User Ingress & Governance
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time user enrollments & role allocation
              </p>
            </div>
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors"
            >
              Manage Users <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card className={`${glowCardClass} !p-0 h-[270px] flex flex-col`}>
            <CardContent className="flex flex-col h-full min-h-0 !p-0">
              <div
                ref={usersScrollRef}
                className="min-h-0 flex-1 overflow-y-scroll"
              >
                <div ref={usersContentRef} className="divide-y divide-border/50 min-h-full">
                  {recentUsers && recentUsers.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">No recent users.</div>
                  ) : (
                    recentUsers?.map((u) => {
                      const userInitial = (u.name?.trim() || "U").charAt(0).toUpperCase();
                      return (
                        <div key={u.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/40 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {userInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs text-foreground truncate">{u.name}</p>
                                {u.plan && (
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                    u.plan === 'PRO' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' :
                                    u.plan === 'PLUS' ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30' :
                                    'bg-muted/60 text-muted-foreground border border-border/40'
                                  }`}>
                                    {u.plan}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              {(u.careerProfile?.targetRoleName || u.careerProfile?.targetRole) && (
                                <p className="text-xs font-medium text-primary mt-0.5 truncate">
                                  🎯 {u.careerProfile.targetRoleName || u.careerProfile.targetRole}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 text-right gap-1">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary whitespace-nowrap uppercase">
                              {u.role}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ============================= RECENT ACTIVITY ============================= */}
      <section>
        <div className="mb-3.5 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Governance Audit Stream
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time platform events, security verifications & user activities
            </p>
          </div>
          <Link
            href="/dashboard/admin/activity"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors shrink-0 whitespace-nowrap mt-0.5 sm:mt-0"
          >
            View Complete Stream <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Card className={`${glowCardClass} !p-0`}>
          <CardContent className="!p-0">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No recent activity logged.</div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentActivity.map((a) => {
                  const formattedDate = new Date(a.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={a.id} className="p-3 sm:p-3.5 hover:bg-muted/40 transition-colors">
                      {/* Mobile Layout (< sm) */}
                      <div className="flex sm:hidden items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-foreground uppercase tracking-wide truncate">
                              {a.type.replace(/_/g, " ")}
                            </span>
                            <span className="shrink-0 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs rounded-md bg-muted px-2 py-0.5 text-muted-foreground font-mono truncate max-w-[220px]">
                              {a.user.email}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {a.description || `Action executed by ${a.user.name}`}
                          </p>
                        </div>
                      </div>

                      {/* Desktop / Tablet Layout (sm+) */}
                      <div className="hidden sm:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground uppercase tracking-wide">
                                {a.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground font-mono">
                                {a.user.email}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground mt-0.5">
                              {a.description || `Action executed by ${a.user.name}`}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HealthRow({ label, status, type }: { label: string; status: string; type: string }) {
  const isOk = status.startsWith("✓");
  const isNotTracked = status === "Not tracked yet";
  const latencyMatch = status.match(/(\d+)ms/);
  const latency = latencyMatch ? `${latencyMatch[1]}ms` : null;

  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-0 pb-2.5 last:pb-0">
      <div className="flex flex-col">
        <span className="font-semibold text-xs text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{type}</span>
      </div>
      {isNotTracked ? (
        <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full font-medium">{status}</span>
      ) : isOk ? (
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> {latency ?? "Operational"}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
          <XCircle className="h-3.5 w-3.5" /> {latency ?? "Degraded"}
        </span>
      )}
    </div>
  );
}
