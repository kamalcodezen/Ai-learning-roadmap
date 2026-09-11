"use client";

import { useState, useEffect } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getLearningPath,
  completeMilestone,
  getMilestoneResources,
  CuratedResource,
} from "@/src/lib/api/learner/learning-path";
import { generateMilestoneProject } from "@/src/lib/api/learner/portfolio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LearningPathSkeleton from "../LearningPathSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Target,
  FolderKanban,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { DashboardButton } from "@/src/components/dashboard/shared/patterns";

function isMatchingSkillFrontend(aRaw: string, bRaw: string): boolean {
  if (!aRaw || !bRaw) return false;
  const a = aRaw.toLowerCase().trim();
  const b = bRaw.toLowerCase().trim();
  if (a === b) return true;
  if ((a === "react" && b === "react native") || (b === "react" && a === "react native")) return false;
  const aClean = a.replace(/[^a-z0-9]/g, "");
  const bClean = b.replace(/[^a-z0-9]/g, "");
  if (aClean && bClean && aClean === bClean) return true;
  if (a.startsWith("node.js") && (b === "node.js" || b === "node")) return true;
  if (b.startsWith("node.js") && (a === "node.js" || a === "node")) return true;
  if (a.startsWith("html") && (b === "html" || b === "html5")) return true;
  if (b.startsWith("html") && (a === "html" || a === "html5")) return true;
  if (a.startsWith("css") && (b === "css" || b === "css3")) return true;
  if (b.startsWith("css") && (a === "css" || a === "css3")) return true;
  if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) return true;

  const aParts = a.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
  const bParts = b.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
  if (aParts.length > 1 || bParts.length > 1) {
    for (const pA of aParts) {
      for (const pB of bParts) {
        if (pA === pB) return true;
        const pAClean = pA.replace(/[^a-z0-9]/g, "");
        const pBClean = pB.replace(/[^a-z0-9]/g, "");
        if (pAClean && pBClean && pAClean === pBClean) return true;
        if (pA.length >= 3 && pB.length >= 3 && (pA.includes(pB) || pB.includes(pA))) return true;
      }
    }
  }
  return false;
}

export default function LearningPathContent() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [generatedProject, setGeneratedProject] = useState<{
    id: string;
    title: string;
    description: string;
    techStack: string[];
    duplicate?: boolean;
  } | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const skillParam = searchParams?.get("skill")?.trim() || null;
  const milestoneParam = searchParams?.get("milestone")?.trim() || null;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["learningPath", session?.user?.id],
    queryFn: () => getLearningPath(),
    enabled: !!session?.user?.id,
  });

  // Validate and locate target milestone from query params safely using canonical skill matching
  const targetMilestone = (() => {
    if (!data?.milestones || data.milestones.length === 0) return null;

    if (skillParam) {
      // 1. If milestoneParam is also supplied, verify if that exact milestone covers skillParam
      if (milestoneParam) {
        const exactMatch = data.milestones.find(
          (m) =>
            m.id === milestoneParam &&
            m.skillsCovered.some((s) => isMatchingSkillFrontend(s, skillParam))
        );
        if (exactMatch) return exactMatch;
      }

      // 2. Find the first milestone in the roadmap explicitly covering skillParam via canonical matching
      const skillMatch = data.milestones.find((m) =>
        m.skillsCovered.some((s) => isMatchingSkillFrontend(s, skillParam))
      );
      if (skillMatch) return skillMatch;

      // Do NOT attach target badge to an unrelated milestone if no milestone covers skillParam
      return null;
    }

    // 3. Fallback: if no skillParam is provided, match by milestoneParam if valid
    if (milestoneParam) {
      const milestoneMatch = data.milestones.find((m) => m.id === milestoneParam);
      if (milestoneMatch) return milestoneMatch;
    }

    return null;
  })();
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
      queryClient.invalidateQueries({
        queryKey: ["learningPath", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
    },
  });

  const generateProjectMutation = useMutation({
    mutationFn: (opts: { milestoneId?: string; skill?: string }) =>
      generateMilestoneProject(opts.milestoneId, opts.skill),
    onSuccess: (resData) => {
      setProjectError(null);
      const proj = (resData?.project || resData?.data || resData) as unknown as Record<string, unknown>;
      const titleVal = typeof proj?.title === "string" ? proj.title : (typeof proj?.name === "string" ? proj.name : "Milestone Project");
      const descVal = typeof proj?.description === "string" ? proj.description : "Project specification generated.";
      const techVal = Array.isArray(proj?.techStack) ? (proj.techStack as string[]) : [];
      setGeneratedProject({
        id: typeof proj?.id === "string" ? proj.id : "",
        title: titleVal,
        description: descVal,
        techStack: techVal,
        duplicate: !!resData?.duplicate,
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
    },
    onError: (err: Error) => {
      setProjectError(err.message || "Failed to generate project. Please try again.");
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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Roadmap Error</h3>
        <p className="text-muted-foreground">
          Failed to load your roadmap. Please try refreshing the page.
        </p>
        <DashboardButton text="Retry" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  if (!data || !data.milestones || data.milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center max-w-lg mx-auto p-8 rounded-2xl border-2 border-dashed border-border bg-card/40">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">No Roadmap Milestones Yet</h3>
        <p className="text-sm text-muted-foreground">
          Your learning roadmap is personalized based on your career goals and assessment results. Take the diagnostic to generate your custom milestones.
        </p>
        <DashboardButton
          href="/diagnostic"
          text="Take Diagnostic Assessment"
          size="lg"
          radius="xl"
          icon={<ArrowRight className="w-4 h-4" />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Target className="w-4 h-4" /> {data.targetRole}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {data.roadmapTitle}
          </h1>
          <p className="text-muted-foreground">
            Your AI-generated personalized curriculum.
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shrink-0 min-w-[200px]">
          <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">
              {data.overallProgress}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${data.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {skillParam && !targetMilestone && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-amber-700 dark:text-amber-300 text-sm">
          <Target className="w-5 h-5 shrink-0 text-amber-500" />
          <span>
            Target Skill Gap: <strong>{skillParam}</strong> is preserved, but no directly linked milestone covers this skill in your current active roadmap.
          </span>
        </div>
      )}

      <div className="flex flex-col relative">
        <div className="absolute left-[27px] top-4 bottom-12 w-0.5 bg-border z-0 hidden md:block" />

        <div className="flex flex-col dashboard-card-gap relative z-10">
          {data.milestones.map((milestone, idx) => {
            const isTarget = milestone.id === targetMilestoneId;

            return (
              <div
                key={milestone.id}
                id={`milestone-${milestone.id}`}
                data-target-milestone={isTarget ? "true" : undefined}
                className="flex flex-col md:flex-row gap-4 md:gap-8 scroll-mt-24"
              >
                <div className="hidden md:flex flex-col items-center p-0 md:pt-5">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-background ${
                      milestone.status === "completed"
                        ? "bg-green-500 text-white"
                        : milestone.status === "current"
                          ? "bg-primary text-white"
                          : isTarget
                            ? "bg-primary/20 border-primary text-primary font-bold"
                            : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {milestone.status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : milestone.status === "current" ? (
                      <span className="font-bold">{idx + 1}</span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                </div>

                <Card
                  mouseGlow
                  className={`group relative overflow-hidden flex-1 transition-all duration-300 rounded-xl border-2 shadow-none proof-card ${
                    milestone.status === "current"
                      ? "border-brand"
                      : isTarget
                        ? "border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10"
                        : "border-background"
                  }`}
                >
                  {/* Corner shape */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

                  <CardContent>
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {milestone.status === "completed" && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                                Completed
                              </span>
                            )}
                            {milestone.status === "current" && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                In Progress
                              </span>
                            )}
                            {milestone.status === "upcoming" && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Upcoming
                              </span>
                            )}
                            {isTarget && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1 animate-pulse">
                                🎯 Target Skill Gap:{" "}
                                {skillParam || milestone.skillsCovered[0]}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold">
                            {milestone.title}
                          </h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>

                        <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm">
                          <span className="font-semibold mr-1">
                            Why it matters:
                          </span>{" "}
                          {milestone.whyItMatters}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />{" "}
                            {milestone.estimatedTime}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />{" "}
                            {milestone.skillsCovered.join(", ")}
                          </div>
                        </div>
                        <MilestoneResourcesAccordion
                          milestoneId={milestone.id}
                          skills={milestone.skillsCovered}
                          defaultOpen={isTarget}
                        />
                      </div>

                      <div className="lg:w-48 flex flex-col justify-center gap-4 lg:border-l lg:border-border lg:pl-6 shrink-0">
                        {milestone.status === "current" &&
                          milestone.progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-bold">
                                  {milestone.progress}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${milestone.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                        {milestone.status === "current" ? (
                          <div className="flex flex-col gap-2">
                            <DashboardButton
                              fullWidth
                              text={
                                <>
                                  {completeMutation.isPending &&
                                  completeMutation.variables === milestone.id
                                    ? "Completing..."
                                    : "Complete"}{" "}
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              }
                              onClick={() =>
                                completeMutation.mutate(milestone.id)
                              }
                              disabled={completeMutation.isPending}
                            />
                            <button
                              onClick={() =>
                                generateProjectMutation.mutate({
                                  milestoneId: milestone.id,
                                  skill: skillParam || undefined,
                                })
                              }
                              disabled={generateProjectMutation.isPending}
                              className="w-full bg-muted text-foreground hover:bg-card-soft py-2 rounded-lg text-xs font-medium border border-border flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                              {generateProjectMutation.isPending &&
                              generateProjectMutation.variables?.milestoneId === milestone.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FolderKanban className="w-3.5 h-3.5 text-primary" />
                                  Generate Project
                                </>
                              )}
                            </button>
                          </div>
                        ) : milestone.status === "upcoming" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              className="w-full bg-muted text-muted-foreground py-2.5 rounded-lg text-sm font-medium border border-border cursor-not-allowed"
                              disabled
                            >
                              Locked
                            </button>
                            {isTarget && (
                              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                                Milestone completion is locked until
                                prerequisite milestones are completed. You can
                                still study the curated resources below.
                              </p>
                            )}
                          </div>
                        ) : (
                          <Link
                            href="/dashboard/learner/portfolio"
                            className="w-full bg-card text-foreground py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-card-soft transition-all text-center block"
                          >
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

        {projectError && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{projectError}</span>
            </div>
            <button
              onClick={() => setProjectError(null)}
              className="p-1 hover:bg-destructive/20 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {generatedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${generatedProject.duplicate ? "bg-amber-500/10 text-amber-400" : "bg-primary/10 text-primary"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {generatedProject.duplicate
                        ? "You already have an AI project for this learning context."
                        : "Milestone Project Generated"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {generatedProject.duplicate
                        ? "AI Pather reused your existing project instead of creating another duplicate."
                        : "Added to your portfolio evidence graph"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGeneratedProject(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {generatedProject.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {generatedProject.description}
                  </p>
                </div>

                {generatedProject.duplicate && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" /> Existing Project Reused:
                    </p>
                    <p className="text-muted-foreground">
                      This context already has a project, so AI Pather reused the existing project instead of creating another one.
                    </p>
                  </div>
                )}

                {generatedProject.techStack && generatedProject.techStack.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                      Technologies / Skills Covered
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedProject.techStack.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGeneratedProject(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                  <Link
                    href="/dashboard/learner/portfolio"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    {generatedProject.duplicate ? "View Existing Project" : "View in Portfolio"} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
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
        className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {isOpen
          ? "Hide Curated Learning Resources"
          : "Explore Curated Learning Resources"}
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
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
            <p className="text-xs text-destructive">
              Failed to load resources. Please try again.
            </p>
          )}

          {data?.data?.resources && data.data.resources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {data.data.resources.map((res: CuratedResource) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-card-soft hover:bg-muted border border-border/70 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                        {res.type}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {res.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {res.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/80">
                    <span>{res.provider}</span>
                    {res.isOfficial && (
                      <span className="text-green-500 font-medium">
                        Official
                      </span>
                    )}
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
