"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import {
  Users,
  Route,
  ClipboardCheck,
  FolderKanban,
  Sparkles,
  Activity,
  UserPlus,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAdminDashboardStats } from "@/src/lib/api/admin/dashboard";
import { authClient } from "@/src/lib/auth-client";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import dashboardBanner from "@/public/images/dashboardBanner.png";
import dashboardBannerDark from "@/public/images/dashboardBannerDark.png";

interface Kpi {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const glowCardClass =
  "group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]";

export default function DashboardStats() {
  const { data: session } = authClient.useSession();

  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const syncTheme = () =>
      setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const firstName = session?.user?.name?.trim().split(" ")[0] || "Admin";
  const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const userId = session?.user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboardStats", userId],
    queryFn: () => getAdminDashboardStats(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return <GenericPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load dashboard stats. Please try again.</p>
      </div>
    );
  }

  const { overview, systemHealth, recentUsers, recentActivity } = data;

  const kpis: Kpi[] = [
    { title: "Total Users", value: overview.totalUsers, icon: Users, color: "bg-blue-500/10 text-blue-500" },
    { title: "Active Learners", value: overview.activeLearners, icon: UserPlus, color: "bg-green-500/10 text-green-500" },
    { title: "Total Roadmaps", value: overview.totalRoadmaps, icon: Route, color: "bg-purple-500/10 text-purple-500" },
    { title: "Assessments", value: overview.totalAssessments, icon: ClipboardCheck, color: "bg-amber-500/10 text-amber-500" },
    { title: "Projects", value: overview.totalProjects, icon: FolderKanban, color: "bg-indigo-500/10 text-indigo-500" },
    { title: "AI Requests", value: overview.aiRequests, icon: Sparkles, color: "bg-pink-500/10 text-pink-500" },
  ];

  const adminBannerStats = [
    { value: overview.totalUsers, label: "Total Users" },
    { value: overview.activeLearners, label: "Active Learners" },
    { value: overview.totalRoadmaps, label: "Roadmaps" },
    { value: overview.totalAssessments + overview.totalProjects, label: "Assessments + Projects" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-4 animate-in fade-in duration-500">
      {/* ============================= WELCOME BANNER ============================= */}
      <section className="relative w-full overflow-hidden rounded-md border border-border min-h-[200px] sm:min-h-[220px] lg:min-h-[250px]">
        <Image src={dark ? dashboardBannerDark : dashboardBanner} alt="" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="relative z-10 flex min-h-[200px] flex-col justify-between px-4 py-5 sm:min-h-[220px] sm:px-6 sm:py-6 lg:min-h-[250px] lg:px-8 lg:py-7">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              Welcome back, <span className="text-secondary">{capitalized}</span>
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-foreground/90 sm:text-base">
              Here&apos;s your platform overview and system health at a glance.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {adminBannerStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_12px_35px_rgba(159,84,247,0.10)] dark:border-white/10 dark:bg-[#111111]/70 dark:shadow-none dark:hover:border-primary/30 dark:hover:shadow-[0_0_30px_rgba(185,120,255,0.08)] backdrop-blur-xs"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" aria-hidden="true" />
                <div className="relative z-10">
                  <div className="text-3xl font-extrabold leading-none tracking-tight text-primary sm:text-4xl">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</p>
                  <div className="mt-4 h-1 w-9 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= KPI GRID ============================= */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Platform Overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} mouseGlow className={glowCardClass}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
                <CardContent className="relative z-10 flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className={`mt-1 ${dark ? "text-2xl" : "text-2xl"} font-bold tracking-tight text-foreground`}>
                      {kpi.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ============================= HEALTH + RECENT USERS ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">System Health</h2>
          <Card mouseGlow className={glowCardClass}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
            <CardContent className="relative z-10 space-y-4">
              <HealthRow label="Backend API" status={systemHealth.backend} />
              <HealthRow label="Database" status={systemHealth.database} />
              <HealthRow label="Authentication" status={systemHealth.auth} />
              <HealthRow label="AI Providers" status={systemHealth.ai} />
            </CardContent>
          </Card>
        </section>

        {/* Recent Users */}
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Recent Users</h2>
          <Card mouseGlow className={`${glowCardClass} !p-0`}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
            <CardContent className="relative z-10">
              <div className="divide-y divide-border/50">
                {recentUsers.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No recent users.</div>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {u.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ============================= RECENT ACTIVITY ============================= */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
          <a href="/dashboard/admin/activity" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary transition-colors">
            View All <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <Card mouseGlow className={`${glowCardClass} !p-0`}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
          <CardContent className="relative z-10">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No recent activity.</div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{a.type}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.description || a.user.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const isOk = status.startsWith("✓");
  const isNotTracked = status === "Not tracked yet";
  const latencyMatch = status.match(/(\d+)ms/);
  const latency = latencyMatch ? `${latencyMatch[1]}ms` : null;

  return (
    <div className="flex items-center justify-between border-b border-border/40 last:border-0 pb-3 last:pb-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      {isNotTracked ? (
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{status}</span>
      ) : isOk ? (
        <span className="flex items-center gap-1.5 text-sm font-bold text-green-500">
          <CheckCircle2 className="h-4 w-4" /> {latency ?? "OK"}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm font-bold text-red-500">
          <XCircle className="h-4 w-4" /> {latency ?? "Down"}
        </span>
      )}
    </div>
  );
}
