"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, AlertTriangle, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { fetchCareerAnalysis, triggerCareerAnalysis } from "@/src/lib/actions/learner/career-analysis";
import { glowCardClass } from "@/src/components/dashboard/shared/cards";

export default function CareerGoalAnalysis() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["careerAnalysis"],
    queryFn: async () => {
      const res = await fetchCareerAnalysis();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await triggerCareerAnalysis();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerAnalysis"] });
    },
  });

  const analysis = data;

  if (isLoading) {
    return (
      <div className={`mt-8 ${glowCardClass} p-6 animate-pulse`}>
        <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`mt-8 ${glowCardClass} p-6`}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Analysis Unavailable</h3>
        </div>
        <p className="mt-2 text-muted-foreground text-sm">
          {error instanceof Error ? error.message : "Failed to load career analysis."}
        </p>
        <button
          onClick={() => generateMutation.mutate()}
          className="mt-4 px-4 py-2 bg-primary text-white hover:opacity-90 rounded-xl text-sm font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`mt-8 ${glowCardClass} p-6 flex flex-row flex-wrap items-center justify-center gap-4 text-center md:justify-between md:text-left`}>
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              Career Goal Analysis
            </h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Unlock AI-powered insights into required skills and expectations for your target role.
            </p>
          </div>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="shrink-0 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generateMutation.isPending ? "Analyzing..." : "Analyze Career Goal"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className={`${glowCardClass} p-6`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Career Intelligence: {analysis.role}
          </h3>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-3 py-1.5 bg-card-soft border border-border text-muted-foreground hover:bg-muted rounded-xl text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            {generateMutation.isPending ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </div>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          {analysis.summary}
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Core Skills</h4>
            <div className="space-y-3">
              {analysis.coreSkills.map((skill, i) => (
                <div key={i} className="bg-card-soft p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {skill.name}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground ml-6">{skill.reason}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Supporting Skills</h4>
            <div className="space-y-3">
              {analysis.supportingSkills.map((skill, i) => (
                <div key={i} className="bg-card-soft p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    {skill.name}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground ml-6">{skill.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Practical Expectations</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {analysis.practicalCompetencies.map((comp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span> {comp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}