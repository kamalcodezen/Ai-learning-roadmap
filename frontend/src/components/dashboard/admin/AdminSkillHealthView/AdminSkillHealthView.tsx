"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSkillHealth } from "@/src/lib/api/admin/skill-health";
import { authClient } from "@/src/lib/auth-client";
import { Zap, TrendingDown } from "lucide-react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { CardContent, CardHeader } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";

export default function AdminSkillHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminSkillHealth", userId],
    queryFn: () => getAdminSkillHealth(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="split-cards" />;
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load skill health data. Please try again.
        </p>
      </div>
    );
  }

  type Skill = {
    id?: string;
    name: string;
    category?: string;
    averageProficiency?: number;
    activeLearners?: number;
    averageScore: number;
    usersCount?: number;
  };

  const renderSkillRows = (skills: Skill[], variant: "strong" | "weak") =>
    skills.map((s, index) => (
      <div
        key={s.id || s.name || `${variant}-${index}`}
        className="flex items-center justify-between border-t border-[var(--color-border)] py-3 px-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${variant === "strong" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
          >
            {variant === "strong" ? (
              <Zap className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.category || "Skill"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-foreground">{Math.round(s.averageScore)}%</div>
          <div className="text-xs text-muted-foreground">{s.usersCount || s.activeLearners || 0} learners</div>
        </div>
      </div>
    ));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Skill <span className="text-brand">Health</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Identify strengths and learning debt across competencies and learner cohorts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        <DashboardCard className="p-0!">
          <CardHeader className="border-b border-border gap-0 p-4">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-green-500" />
              <h2 className="text-sm font-medium">Strong Skills</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.strongSkills.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No strong skills found.
              </p>
            ) : (
              renderSkillRows(data.strongSkills, "strong")
            )}
          </CardContent>
        </DashboardCard>

        <DashboardCard className="p-0!">
          <CardHeader className="border-b border-border gap-0 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-red-500" />
              <h2 className="text-sm font-medium">Weak Skills / Learning Debt</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.weakSkills.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No weak skills found.
              </p>
            ) : (
              renderSkillRows(data.weakSkills, "weak")
            )}
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
