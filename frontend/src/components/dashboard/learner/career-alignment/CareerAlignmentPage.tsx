"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getCareerAlignment } from "@/src/lib/api/learner/career-alignment";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardCard } from "../dashboard-card";
import { CheckCircle2, Target, AlertTriangle, ArrowRight, Lightbulb, Compass } from "lucide-react";
import Link from "next/link";

export default function CareerAlignmentPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["careerAlignment", session?.user?.id],
    queryFn: () => getCareerAlignment(),
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

  if (data.targetRole === "NO_TARGET_ROLE") {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Career Alignment</h1>
          <p className="text-muted-foreground">See how your current skills match up against your target role requirements.</p>
        </div>
        <DashboardCard className="max-w-xl mx-auto mt-10">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No target career set.</h3>
            <p className="text-muted-foreground mb-6">
              Complete your onboarding to set a target career and see your alignment.
            </p>
            <Link href={data.href} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:brightness-110">
              {data.nextAction}
            </Link>
          </CardContent>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Career Alignment</h1>
        <p className="text-muted-foreground">See how your current skills match up against your target role requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Target Role</p>
              <h2 className="text-3xl font-bold text-foreground">{data.targetRole}</h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-primary/20"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${data.matchPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{data.matchPercentage}%</span>
                  <span className="text-xs font-semibold text-muted-foreground">Match</span>
                </div>
              </div>
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard className="col-span-1 border-primary/30 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Compass className="w-5 h-5" /> Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 z-10">
            <p className="text-sm text-muted-foreground mb-6">
              You are on the right track! Focus on acquiring your missing high-priority skills.
            </p>
            <Link
              href={data.href}
              className="mt-auto w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2 transition-all"
            >
              {data.nextAction} <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Strong Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.strongSkills.length > 0 ? data.strongSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                  {skill}
                </span>
              )) : <span className="text-sm text-muted-foreground">None yet.</span>}
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-500" /> Developing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.developingSkills?.length > 0 ? data.developingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium border border-blue-500/20">
                  {skill}
                </span>
              )) : <span className="text-sm text-muted-foreground">None currently developing.</span>}
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.length > 0 ? data.missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/20">
                  {skill}
                </span>
              )) : <span className="text-sm text-muted-foreground">No missing skills!</span>}
            </div>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Critical Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.criticalGaps?.length > 0 ? data.criticalGaps.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                  {skill}
                </span>
              )) : <span className="text-sm text-muted-foreground">No critical gaps!</span>}
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      <DashboardCard>
        <CardHeader>
          <CardTitle>Detailed Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.requirements.map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card-soft flex flex-col justify-between h-full gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{req.skill}</span>
                  {req.status === 'acquired' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : req.status === 'learning' ? (
                    <Target className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    req.importance === 'High' ? 'bg-destructive/10 text-destructive' :
                    req.importance === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {req.importance} Priority
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DashboardCard>

      <DashboardCard className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" /> Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
