"use client";
import { PageHeader, DashboardButton } from "@/src/components/dashboard/shared/patterns";

import { redirect } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { getCareerTwin } from "@/src/lib/api/learner/career-twin";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import { CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import { useState } from "react";
import {
  Bot,
  Target,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Printer,
  Compass,
  Sparkles,
} from "lucide-react";

export default function CareerTwinPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [simulatedRole, setSimulatedRole] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["careerTwin", session?.user?.id],
    queryFn: () => getCareerTwin(),
    enabled: !!session?.user?.id,
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
        <h3 className="text-xl font-bold text-destructive">Error</h3>
        <p className="text-muted-foreground">Failed to load career twin. Please refresh.</p>
        <DashboardButton text="Retry" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Career Twin"
          description="Your AI-generated professional profile and readiness analysis."
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/80">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Simulate:</span>
            <select
              value={simulatedRole || data.targetRole}
              onChange={(e) => setSimulatedRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value={data.targetRole} className="bg-card text-foreground">{data.targetRole} (Current Target)</option>
              <option value="Full Stack Developer" className="bg-card text-foreground">Full Stack Developer</option>
              <option value="Frontend Developer" className="bg-card text-foreground">Frontend Developer</option>
              <option value="Backend Developer" className="bg-card text-foreground">Backend Developer</option>
              <option value="AI Engineer" className="bg-card text-foreground">AI Engineer</option>
              <option value="DevOps Engineer" className="bg-card text-foreground">DevOps Engineer</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-card-soft text-xs font-semibold text-foreground transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            Export PDF
          </button>
        </div>
      </div>

      {simulatedRole && simulatedRole !== data.targetRole && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground animate-in fade-in">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>What-If Simulation Active:</strong> Evaluating your verified competencies against the benchmark criteria for <strong>{simulatedRole}</strong>.
          </span>
          <button
            type="button"
            onClick={() => setSimulatedRole("")}
            className="ml-auto text-primary hover:underline font-semibold"
          >
            Reset to Target
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard className="col-span-1 lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Target Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-soft p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Target Role
                </p>
                <p className="font-semibold text-lg">{data.targetRole}</p>
              </div>
              <div className="bg-card-soft p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-1">Level</p>
                <p className="font-semibold text-lg">{data.experienceLevel}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Granular Readiness
              </h3>
              <div className="space-y-3">
                {Object.entries(data.scores).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(value as number) > 70 ? "bg-green-500" : (value as number) > 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        <div className="col-span-1 flex flex-col gap-6">
          <DashboardCard className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" /> Overall Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold text-primary">
                  {data.readinessScore}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your assessments, projects, and evidence provided.
              </p>
            </CardContent>
          </DashboardCard>

          <DashboardCard>
            <CardHeader>
              <CardTitle className="text-lg">Skill Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Strong
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.strongSkills.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">None identified yet</span>
                  ) : (
                    data.strongSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs
                  Work
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.weakSkills.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">None identified</span>
                  ) : (
                    data.weakSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="text-lg">Identified Career Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {data.careerGaps.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No critical career gaps identified.</p>
            ) : (
              <ul className="space-y-3">
                {data.careerGaps.map((gap, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted-foreground"
                  >
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </DashboardCard>

        <DashboardCard className="border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="w-5 h-5" /> Recommended Action
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col h-[calc(100%-4rem)]">
            <h3 className="font-semibold text-lg mb-2">
              {data.recommendedAction.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              {data.recommendedAction.description}
            </p>
            <DashboardButton
              href={data.recommendedAction.href}
              text={data.recommendedAction.actionLabel}
              icon={<ArrowRight className="w-4 h-4" />}
              size="md"
              radius="xl"
            />
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
