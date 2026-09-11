"use client";
import { useState } from "react";
import { PageHeader, DashboardButton } from "@/src/components/dashboard/shared/patterns";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getApplicationReadiness } from "@/src/lib/api/learner/application-readiness";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import { CardContent } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  Code,
  MessagesSquare,
  Wrench,
  Brain,
  Download,
  Share2,
  Check,
} from "lucide-react";

export default function ApplicationReadinessPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
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
        <p className="text-muted-foreground">Failed to load application readiness. Please refresh.</p>
        <DashboardButton text="Retry" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "strong":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          color: "text-green-500",
          bg: "bg-green-500/10 border-green-500/20",
          label: "Strong",
        };
      case "needs_improvement":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/20",
          label: "Needs Improvement",
        };
      case "critical":
        return {
          icon: <XCircle className="w-5 h-5 text-destructive" />,
          color: "text-destructive",
          bg: "bg-destructive/10 border-destructive/20",
          label: "Critical",
        };
      case "missing":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-muted-foreground" />,
          color: "text-muted-foreground",
          bg: "bg-muted border-border",
          label: "Not Assessed",
        };
      default:
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-muted-foreground" />,
          color: "text-muted-foreground",
          bg: "bg-muted border-border",
          label: "Unknown",
        };
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes("Technical") || name.includes("Knowledge")) return <Code className="w-5 h-5" />;
    if (name.includes("Practical")) return <Wrench className="w-5 h-5" />;
    if (name.includes("Portfolio") || name.includes("Project")) return <Briefcase className="w-5 h-5" />;
    if (name.includes("Problem")) return <Brain className="w-5 h-5" />;
    if (name.includes("Communication")) return <MessagesSquare className="w-5 h-5" />;
    if (name.includes("Interview")) return <MessagesSquare className="w-5 h-5" />;
    return <Briefcase className="w-5 h-5" />;
  };

  const handleCopySummary = () => {
    const formatDim = (val: number | string | undefined) =>
      val !== undefined && val !== "NOT_ASSESSED" && val !== null ? `${val}%` : "Not Assessed";

    const summary =
      `Career Readiness Audit: ${data.overallScore}% (${data.isReady ? "Ready to Apply" : "In Progress"})\n` +
      `• Knowledge Proficiency: ${formatDim(data.dimensions?.knowledgeProficiency)}\n` +
      `• Practical Competence: ${formatDim(data.dimensions?.practicalCompetence)}\n` +
      `• Project Execution: ${formatDim(data.dimensions?.projectExecution)}\n` +
      `• Problem Solving: ${formatDim(data.dimensions?.problemSolving)}\n` +
      `• Communication Skills: ${formatDim(data.dimensions?.communication)}\n` +
      `• Interview Preparedness: ${formatDim(data.dimensions?.interviewPreparedness)}\n` +
      `Verified via AI Learning Roadmap Canonical Readiness Engine.`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Application Readiness"
          description="Are you ready to apply for jobs? Let's analyze your entire profile."
        />
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Share Summary</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export Audit (PDF)</span>
          </button>
        </div>
      </div>

      <DashboardCard
        className={`border-l-4 ${data.isReady ? "border-l-green-500" : "border-l-amber-500"}`}
      >
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              {data.isReady
                ? "You are ready to apply!"
                : "Not quite ready yet."}
            </h2>
            <p className="text-muted-foreground">
              {data.isReady
                ? "Your profile strongly aligns with industry standards. Start sending out applications!"
                : "Your overall readiness score is below the recommended threshold. Review the areas needing improvement below."}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div
              className={`text-5xl font-bold ${data.isReady ? "text-green-500" : "text-amber-500"}`}
            >
              {data.overallScore}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">
              Overall Readiness
            </span>
          </div>
        </CardContent>
      </DashboardCard>

      {/* 7 Canonical Readiness Dimensions */}
      {data.dimensions && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Canonical Readiness Dimensions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 dashboard-card-gap">
            {[
              { label: "Overall", val: data.dimensions.overallReadiness },
              { label: "Knowledge", val: data.dimensions.knowledgeProficiency },
              { label: "Practical", val: data.dimensions.practicalCompetence },
              { label: "Projects", val: data.dimensions.projectExecution },
              { label: "Problem Solving", val: data.dimensions.problemSolving },
              { label: "Communication", val: data.dimensions.communication },
              {
                label: "Interview",
                val: data.dimensions.interviewPreparedness,
              },
            ].map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border-brand/20 border bg-card/60 flex flex-col items-center justify-center text-center"
              >
                <span className="text-xs text-muted-foreground font-medium truncate">
                  {d.label}
                </span>
                <span className="text-base font-bold text-foreground mt-1">
                  {d.val !== "NOT_ASSESSED" && d.val !== undefined && d.val !== null
                    ? `${d.val}%`
                    : "Not Assessed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 dashboard-card-gap">
        {data.categories.map((category) => {
          const status = getStatusDetails(category.status);

          return (
            <DashboardCard
              key={category.id}
              className="transition-all hover:border-primary/30 group"
            >
              <CardContent className="p-0!">
                <div className="flex flex-col lg:flex-row">
                  <div className="pb-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-background rounded-lg border-brand text-brand shadow-sm">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border-brand border text-brand ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {category.status !== "missing" && (
                        <span className="font-bold text-lg">
                          {category.score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 lg:w-2/3 flex flex-col justify-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {status.icon} Current Status
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.reason}
                      </p>
                    </div>

                    <div className="bg-background/50 p-4 rounded-xl border border-primary/20 space-y-1">
                      <h4 className="text-sm font-semibold text-primary">
                        Recommendation
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
