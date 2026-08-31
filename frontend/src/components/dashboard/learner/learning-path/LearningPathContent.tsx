"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { getLearningPath } from "@/src/lib/api/learner/learning-path";
import { useQuery } from "@tanstack/react-query";
import LearningPathSkeleton from "./LearningPathSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { CheckCircle2, ArrowRight, Clock, BookOpen, Target } from "lucide-react";

export default function LearningPathContent() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["learningPath", session?.user?.id],
    queryFn: () => getLearningPath(),
    enabled: !!session?.user?.id,
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
          {data.milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="hidden md:flex flex-col items-center pt-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-background ${
                  milestone.status === 'completed' ? 'bg-green-500 text-primary-foreground' :
                  milestone.status === 'current' ? 'bg-primary text-primary-foreground' :
                  'bg-muted border-border text-muted-foreground'
                }`}>
                  {milestone.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                   milestone.status === 'current' ? <span className="font-bold">{idx + 1}</span> :
                   <span>{idx + 1}</span>}
                </div>
              </div>

              <Card mouseGlow className={`group relative overflow-hidden flex-1 transition-all duration-300 rounded-md border-2 border-background hover:border-brand shadow-none ${
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
                        <div className="flex items-center gap-2 mb-1">
                          {milestone.status === 'completed' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Completed</span>}
                          {milestone.status === 'current' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">In Progress</span>}
                          {milestone.status === 'upcoming' && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Upcoming</span>}
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
                        <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2 transition-all">
                          Continue Learning <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : milestone.status === 'upcoming' ? (
                        <button className="w-full bg-muted text-muted-foreground py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-card-soft transition-all" disabled>
                          Locked
                        </button>
                      ) : (
                        <button className="w-full bg-card text-foreground py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-card-soft transition-all">
                          Review Material
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
