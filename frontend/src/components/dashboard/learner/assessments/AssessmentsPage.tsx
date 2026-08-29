"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { getAssessments } from "@/src/lib/api/assessments";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { CheckCircle2, PlayCircle, Clock, Trophy, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AssessmentsPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["assessments", session?.user?.id],
    queryFn: () => getAssessments(session!.user!.id),
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Completed</span>;
      case 'in_progress': return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">In Progress</span>;
      case 'not_started': return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Not Started</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
        <p className="text-muted-foreground">Manage your evaluations, diagnostics, and skill tests.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-primary">{data.completedCount}</span>
              <span className="text-sm text-muted-foreground">Completed Tests</span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold">{data.averageScore}%</span>
              <span className="text-sm text-muted-foreground">Average Score</span>
            </div>
            <Trophy className="w-8 h-8 text-amber-500 opacity-80" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Your Evaluations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.assessments.map((assessment) => (
            <Card key={assessment.id} className="flex flex-col h-full transition-all hover:border-primary/30">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(assessment.status)}
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{assessment.type.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-lg font-bold">{assessment.title}</h3>
                    {assessment.skillAssociated && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" /> {assessment.skillAssociated}
                      </div>
                    )}
                  </div>
                  {assessment.score !== undefined && (
                    <div className={`text-2xl font-bold ${assessment.score > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                      {assessment.score}%
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  {assessment.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" /> {assessment.duration}
                  </div>

                  {assessment.status === 'completed' ? (
                    <Link href={assessment.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                      Review Results <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={assessment.href}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 flex items-center gap-2 transition-all"
                    >
                      {assessment.status === 'in_progress' ? 'Continue' : 'Start Now'} <PlayCircle className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
