"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useQuery } from "@tanstack/react-query";
import { getAdminSkillHealth } from "@/src/lib/api/admin/skill-health";
import { authClient } from "@/src/lib/auth-client";
import { Zap, TrendingDown } from "lucide-react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function AdminSkillHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const strongScrollRef = useRef<HTMLDivElement>(null);
  const strongContentRef = useRef<HTMLDivElement>(null);
  const weakScrollRef = useRef<HTMLDivElement>(null);
  const weakContentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminSkillHealth", userId],
    queryFn: () => getAdminSkillHealth(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let lenisStrong: Lenis | null = null;
    let lenisWeak: Lenis | null = null;

    if (strongScrollRef.current && strongContentRef.current) {
      lenisStrong = new Lenis({
        wrapper: strongScrollRef.current,
        content: strongContentRef.current,
        autoRaf: true,
      });
    }

    if (weakScrollRef.current && weakContentRef.current) {
      lenisWeak = new Lenis({
        wrapper: weakScrollRef.current,
        content: weakContentRef.current,
        autoRaf: true,
      });
    }

    return () => {
      lenisStrong?.destroy();
      lenisWeak?.destroy();
    };
  }, [data]);

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="split-cards" />;
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load skill health data. Please try again.
        </p>
      </div>
    );
  }

  type Skill = {
    id?: string;
    name: string;
    category?: string;
    averageProficiency?: number;
    activeLearners?: number;
    averageScore: number;
    usersCount?: number;
  };

  const renderSkillRows = (skills: Skill[], variant: "strong" | "weak") =>
    skills.map((s, index) => (
      <div
        key={s.id || s.name || `${variant}-${index}`}
        className="flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${variant === "strong" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
          >
            {variant === "strong" ? (
              <Zap className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.category || "Skill"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-foreground">{Math.round(s.averageScore)}%</div>
          <div className="text-xs text-muted-foreground">{s.usersCount || s.activeLearners || 0} learners</div>
        </div>
      </div>
    ));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Skill <span className="text-brand">Health</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Identify strengths and learning debt across competencies and learner cohorts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        <Card className="!p-0 h-[calc(100vh-210px)] min-h-[540px] flex flex-col rounded-lg border-2 border-background shadow-none dashboard-card overflow-hidden">
          <CardHeader className="border-b border-border/40 gap-0 p-4 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-green-500" />
              <h2 className="text-sm font-medium">Strong Skills</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full min-h-0 !p-0 relative z-10">
            <div
              ref={strongScrollRef}
              className="min-h-0 flex-1 overflow-y-scroll"
            >
              <div ref={strongContentRef} className="min-h-full divide-y divide-border/40">
                {data.strongSkills.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No strong skills found.
                  </p>
                ) : (
                  renderSkillRows(data.strongSkills, "strong")
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!p-0 h-[calc(100vh-210px)] min-h-[540px] flex flex-col rounded-lg border-2 border-background shadow-none dashboard-card overflow-hidden">
          <CardHeader className="border-b border-border/40 gap-0 p-4 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-red-500" />
              <h2 className="text-sm font-medium">Weak Skills / Learning Debt</h2>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full min-h-0 !p-0 relative z-10">
            <div
              ref={weakScrollRef}
              className="min-h-0 flex-1 overflow-y-scroll"
            >
              <div ref={weakContentRef} className="min-h-full divide-y divide-border/40">
                {data.weakSkills.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No weak skills found.
                  </p>
                ) : (
                  renderSkillRows(data.weakSkills, "weak")
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
