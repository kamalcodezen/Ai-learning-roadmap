"use client";

import { useState, useEffect } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getLearningPath, completeMilestone, getMilestoneResources, CuratedResource } from "@/src/lib/api/learner/learning-path";
import { generateMilestoneProject } from "@/src/lib/api/learner/portfolio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LearningPathSkeleton from "./LearningPathSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { CheckCircle2, ArrowRight, Clock, BookOpen, Target, FolderKanban, ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function LearningPathContent() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const skillParam = searchParams?.get("skill")?.trim() || null;
  const milestoneParam = searchParams?.get("milestone")?.trim() || null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["learningPath", session?.user?.id],
    queryFn: () => getLearningPath(),
    enabled: !!session?.user?.id,
  });

  // Validate and locate target milestone from query params safely
  const targetMilestone = data?.milestones?.find((m) => {
    if (milestoneParam && m.id === milestoneParam) return true;
    if (skillParam && m.skillsCovered.some((s) => s.toLowerCase() === skillParam.toLowerCase() || skillParam.toLowerCase().includes(s.toLowerCase()))) return true;
    return false;
  });
  const targetMilestoneId = targetMilestone?.id || null;

  // Contextual auto-scroll into view when target milestone is resolved
  useEffect(() => {
    if (!targetMilestoneId || !data?.milestones) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`milestone-${targetMilestoneId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [targetMilestoneId, data?.milestones]);

  const completeMutation = useMutation({
    mutationFn: (milestoneId: string) => completeMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningPath", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
    },
  });

  const generateProjectMutation = useMutation({
    mutationFn: (milestoneId: string) => generateMilestoneProject(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
    },
  });

  if (isSessionLoading) {
    return <LearningPathSkeleton />;
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  if (isLoading) {
    return <LearningPathSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Roadmap Error</h3>
        <p className="text-muted-foreground">Failed to load your roadmap. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Target className="w-4 h-4" /> {data.targetRole}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{data.roadmapTitle}</h1>
          <p className="text-muted-foreground">Your AI-generated personalized curriculum.</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shrink-0 min-w-[200px]">
          <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{data.overallProgress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${data.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col relative">
        <div className="absolute left-[27px] top-4 bottom-12 w-0.5 bg-border z-0 hidden md:block" />

        <div className="flex flex-col gap-6 relative z-10">
          {data.milestones.map((milestone, idx) => {
            const isTarget = milestone.id === targetMilestoneId;

            return (
              <div
                key={milestone.id}
                id={`milestone-${milestone.id}`}
                data-target-milestone={isTarget ? "true" : undefined}
                className="flex flex-col md:flex-row gap-4 md:gap-8 scroll-mt-24">
                <div className="hidden md:flex flex-col items-center pt-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-background ${
                    milestone.status === 'completed' ? 'bg-green-500 text-primary-foreground' :
                    milestone.status === 'current' ? 'bg-primary text-primary-foreground' :
                    isTarget ? 'bg-primary/20 border-primary text-primary font-bold' :
                    'bg-muted border-border text-muted-foreground'
                  }`}>
                    {milestone.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                     milestone.status === 'current' ? <span className="font-bold">{idx + 1}</span> :
                     <span>{idx + 1}</span>}
                  </div>
                </div>

                <Card mouseGlow className={`group relative overflow-hidden flex-1 transition-all duration-300 rounded-md border-2 shadow-none ${
                  isTarget
                    ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10'
                    : 'border-background hover:border-brand'
                } ${
                  milestone.status === 'current'
                    ? 'bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]'
                    : milestone.status === 'upcoming'
                    ? 'bg-background dark:!bg-[#0b0f1a]'
                    : 'bg-background'
                }`}>
                  {/* Corner shape */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {milestone.status === 'completed' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Completed</span>}
                            {milestone.status === 'current' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">In Progress</span>}
                            {milestone.status === 'upcoming' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Upcoming</span>}
                            {isTarget && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1 animate-pulse">
                                🎯 Target Skill Gap: {skillParam || milestone.skillsCovered[0]}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold">{milestone.title}</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">{milestone.description}</p>

                        <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm">
                          <span className="font-semibold mr-1">Why it matters:</span> {milestone.whyItMatters}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> {milestone.estimatedTime}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" /> {milestone.skillsCovered.join(", ")}
                          </div>
                        </div>
                        <MilestoneResourcesAccordion
                          milestoneId={milestone.id}
                          skills={milestone.skillsCovered}
                          defaultOpen={isTarget}
                        />
                      </div>

                      <div className="lg:w-48 flex flex-col justify-center gap-4 lg:border-l lg:border-border lg:pl-6 shrink-0">
                        {milestone.status === 'current' && milestone.progress !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-bold">{milestone.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${milestone.progress}%` }} />
                            </div>
                          </div>
                        )}

                        {milestone.status === 'current' ? (
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => completeMutation.mutate(milestone.id)}
                              disabled={completeMutation.isPending}
                              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                              {completeMutation.isPending && completeMutation.variables === milestone.id ? "Completing..." : "Complete Milestone"} <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => generateProjectMutation.mutate(milestone.id)}
                              disabled={generateProjectMutation.isPending}
                              className="w-full bg-muted text-foreground hover:bg-card-soft py-2 rounded-lg text-xs font-medium border border-border flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                              <FolderKanban className="w-3.5 h-3.5 text-primary" />
                              {generateProjectMutation.isPending && generateProjectMutation.variables === milestone.id ? "Generating..." : "Generate Project"}
                            </button>
                          </div>
                        ) : milestone.status === 'upcoming' ? (
                          <div className="flex flex-col gap-2">
                            <button className="w-full bg-muted text-muted-foreground py-2.5 rounded-lg text-sm font-medium border border-border cursor-not-allowed" disabled>
                              Locked
                            </button>
                            {isTarget && (
                              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                                Milestone completion is locked until prerequisite milestones are completed. You can still study the curated resources below.
                              </p>
                            )}
                          </div>
                        ) : (
                          <Link href="/dashboard/learner/portfolio" className="w-full bg-card text-foreground py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-card-soft transition-all text-center block">
                            View Projects
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MilestoneResourcesAccordion({
  milestoneId,
  defaultOpen = false,
}: {
  milestoneId: string;
  skills?: string[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["milestoneResources", milestoneId],
    queryFn: () => getMilestoneResources(milestoneId),
    enabled: isOpen,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache
  });

  return (
    <div className="mt-4 pt-4 border-t border-border/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline transition-all">
        <Sparkles className="w-3.5 h-3.5" />
        {isOpen ? "Hide Curated Learning Resources" : "Explore Curated Learning Resources"}
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 animate-in fade-in duration-300">
          {isLoading && (
            <div className="text-xs text-muted-foreground flex items-center gap-2 py-2">
              <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading verified official resources...
            </div>
          )}

          {isError && (
            <p className="text-xs text-destructive">Failed to load resources. Please try again.</p>
          )}

          {data?.data?.resources && data.data.resources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {data.data.resources.map((res: CuratedResource) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-card-soft hover:bg-muted border border-border/70 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                        {res.type}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{res.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{res.description}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/80">
                    <span>{res.provider}</span>
                    {res.isOfficial && <span className="text-green-500 font-medium">Official</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

