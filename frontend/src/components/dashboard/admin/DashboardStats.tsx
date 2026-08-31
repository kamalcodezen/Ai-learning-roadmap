"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/src/lib/api/admin/dashboard";
import { authClient } from "@/src/lib/auth-client";
import { Users, Route, ClipboardCheck, FolderKanban, ShieldCheck } from "lucide-react";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";

export default function DashboardStats() {
  const { data: session } = authClient.useSession();
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

  const { overview, systemHealth, recentUsers } = data;

  return (
    <div className="space-y-8">
      {/* Platform Overview */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Platform Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={overview.totalUsers} icon={Users} color="text-blue-500" />
          <StatCard title="Active Learners" value={overview.activeLearners} icon={Users} color="text-green-500" />
          <StatCard title="Total Roadmaps" value={overview.totalRoadmaps} icon={Route} color="text-purple-500" />
          <StatCard title="Assessments" value={overview.totalAssessments} icon={ClipboardCheck} color="text-orange-500" />
          <StatCard title="Projects" value={overview.totalProjects} icon={FolderKanban} color="text-indigo-500" />
          <StatCard title="AI Requests" value={overview.aiRequests} icon={ShieldCheck} color="text-muted-foreground" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">System Health</h2>
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <HealthRow label="Backend API" status={systemHealth.backend} />
              <HealthRow label="Database" status={systemHealth.database} />
              <HealthRow label="Authentication" status={systemHealth.auth} />
              <HealthRow label="AI Providers" status={systemHealth.ai} />
            </div>
          </div>
        </section>

        {/* Recent Users */}
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Recent Users</h2>
          <div className="rounded-xl border border-border/50 bg-card p-0 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {recentUsers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No recent users.</div>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-background p-2 shadow-sm ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const isOk = status === "✓";
  const isNotTracked = status === "Not tracked yet";
  
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-muted-foreground">{label}</span>
      {isNotTracked ? (
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{status}</span>
      ) : (
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isOk ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
          {status}
        </span>
      )}
    </div>
  );
}
