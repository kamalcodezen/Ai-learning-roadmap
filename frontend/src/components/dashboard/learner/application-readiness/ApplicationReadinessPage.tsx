"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getApplicationReadiness } from "@/src/lib/api/learner/application-readiness";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { CheckCircle2, AlertTriangle, XCircle, Briefcase, FileText, Code, MessagesSquare } from "lucide-react";

export default function ApplicationReadinessPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applicationReadiness", session?.user?.id],
    queryFn: () => getApplicationReadiness(),
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

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'strong': return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", label: "Strong" };
      case 'needs_improvement': return { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "Needs Improvement" };
      case 'critical': return { icon: <XCircle className="w-5 h-5 text-destructive" />, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Critical" };
      case 'missing': return { icon: <AlertTriangle className="w-5 h-5 text-muted-foreground" />, color: "text-muted-foreground", bg: "bg-muted border-border", label: "Missing Data" };
      default: return { icon: <CheckCircle2 className="w-5 h-5 text-muted-foreground" />, color: "text-muted-foreground", bg: "bg-muted border-border", label: "Unknown" };
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Technical')) return <Code className="w-5 h-5" />;
    if (name.includes('Resume')) return <FileText className="w-5 h-5" />;
    if (name.includes('Interview') || name.includes('Communication')) return <MessagesSquare className="w-5 h-5" />;
    return <Briefcase className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Application Readiness</h1>
        <p className="text-muted-foreground">Are you ready to apply for jobs? Let&apos;s analyze your entire profile.</p>
      </div>

      <Card className={`border-l-4 ${data.isReady ? 'border-l-green-500 bg-green-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}>
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              {data.isReady ? "You are ready to apply!" : "Not quite ready yet."}
            </h2>
            <p className="text-muted-foreground">
              {data.isReady
                ? "Your profile strongly aligns with industry standards. Start sending out applications!"
                : "Your overall readiness score is below the recommended threshold. Review the areas needing improvement below."}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className={`text-5xl font-bold ${data.isReady ? 'text-green-500' : 'text-amber-500'}`}>
              {data.overallScore}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Overall Readiness</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {data.categories.map((category) => {
          const status = getStatusDetails(category.status);

          return (
            <Card key={category.id} className="transition-all hover:border-primary/30 group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border bg-card-soft/50 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      {category.status !== 'missing' && (
                        <span className="font-bold text-lg">{category.score}%</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 lg:w-2/3 flex flex-col justify-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {status.icon} Current Status
                      </h4>
                      <p className="text-sm text-muted-foreground">{category.reason}</p>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-1">
                      <h4 className="text-sm font-semibold text-primary">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{category.recommendation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
