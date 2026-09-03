"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getSkillGaps } from "@/src/lib/api/learner/skill-gaps";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { DashboardCard } from "../dashboard-card";
import { AlertTriangle, TrendingUp, AlertCircle, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function SkillGapsPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["skillGaps", session?.user?.id],
    queryFn: () => getSkillGaps(),
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
        <p className="text-muted-foreground">Failed to load. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Skill Gaps Analysis</h1>
        <p className="text-muted-foreground">Identify and fix the weaknesses holding back your career.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">{data.overallHealth}%</span>
            <span className="text-sm text-muted-foreground">Overall Health</span>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 flex flex-col gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">{data.criticalGaps}</span>
            <span className="text-sm text-destructive/80">Critical Gaps</span>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 flex flex-col gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-500">{data.moderateGaps}</span>
            <span className="text-sm text-amber-500/80">Moderate Gaps</span>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 flex flex-col gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-500">{data.strongSkills}</span>
            <span className="text-sm text-green-500/80">Strong Skills</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-semibold mt-4">Prioritized Action Items</h2>

        {data.gaps.map((gap) => (
          <DashboardCard key={gap.id} className={`border-l-4 ${gap.severity === 'critical' ? 'border-l-destructive' : 'border-l-amber-500'}`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{gap.skill}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gap.severity === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>
                        {gap.severity === 'critical' ? 'Critical Priority' : 'Moderate Priority'}
                      </span>
                    </div>
                    <div className="text-lg font-bold">{gap.score}%</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold text-muted-foreground">Reason for Gap</p>
                      <p>{gap.reason}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-muted-foreground">Evidence Found</p>
                      <p>{gap.evidence}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Based on: <span className="font-medium text-foreground">{gap.relatedAssessment}</span>
                  </p>
                </div>

                <div className="lg:w-64 flex flex-col justify-center bg-card-soft rounded-xl p-4 border border-border">
                  <p className="text-sm font-semibold mb-2">Recommended Action</p>
                  <p className="text-sm text-muted-foreground mb-4">{gap.recommendedAction}</p>
                  <Link
                    href={gap.href}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                  >
                    Fix Gap <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
