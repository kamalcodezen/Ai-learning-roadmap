"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { StatusBadge, DashboardButton } from "@/src/components/dashboard/shared/patterns";
import { useQuery } from "@tanstack/react-query";
import { getAdminLearningDebt } from "@/src/lib/api/admin/learning-debt";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { AlertTriangle, Download, GraduationCap, User } from "lucide-react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function AdminLearningDebtView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminLearningDebt", userId],
    queryFn: () => getAdminLearningDebt(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!scrollRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: contentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [data]);

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={false}
        hasSearch={false}
        hasToolbar={true}
        dropdownCount={0}
      />
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load learning debt. Please try again.
        </p>
      </div>
    );
  }

  const { debtRecords } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Learning <span className="text-brand">Debt</span></h1>
          <p className="section-subtitle mt-1 text-left">Surface where learners fall behind so interventions can be targeted</p>
        </div>
      </div>

      <Card className="!p-0 h-[calc(100vh-210px)] min-h-[540px] flex flex-col rounded-lg border-2 border-background shadow-none dashboard-card overflow-hidden">
        <CardHeader className="border-b border-border/40 gap-0 p-4 shrink-0 relative z-10">
          <div className="flex items-center">
            <p className="flex-1 text-sm text-muted-foreground">
              Learners ranked by debt across skills.
            </p>
            <DashboardButton
              text={
                <>
                  <Download className="h-4 w-4" /> Export CSV
                </>
              }
              onClick={() => exportAdminData(userId!, "learning-debt")}
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-full min-h-0 !p-0 relative z-10">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-scroll overflow-x-auto"
          >
            <div ref={contentRef} className="min-h-full">
              <table className="w-full min-w-[600px] border-collapse">
                <thead className="sticky top-0 bg-card z-10 border-b border-border/40 shadow-xs">
                  <tr>
                    <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                      Skill
                    </th>
                    <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                      Learner
                    </th>
                    <th className="p-4 text-center font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                      Knowledge Score
                    </th>
                    <th className="p-4 text-center font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
                      Practice Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {debtRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4">
                        <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                          <GraduationCap className="h-8 w-8 opacity-50" />
                          No learning debt found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    debtRecords.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                              <AlertTriangle className="size-4" />
                            </div>
                            <div className="font-medium text-foreground">
                              {r.skillName}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">
                                {r.user?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {r.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge tone="red">
                            {r.knowledgeScore}%
                          </StatusBadge>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge tone="red">{r.practiceScore}%</StatusBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
