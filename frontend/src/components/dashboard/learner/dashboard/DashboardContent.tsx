"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/src/lib/api/learner/dashboard";
import DashboardSkeleton from "./DashboardSkeleton";
import NextBestActionCard from "../NextBestActionCard";
import LearningDebtCard from "../LearningDebtCard";
import SkillHealthCard from "../SkillHealthCard";
import WeeklyProgressCard from "../WeeklyProgressCard";
import AssessmentProgressCard from "../AssessmentProgressCard";
import dynamic from "next/dynamic";
const ChatBox = dynamic(() => import("@/src/components/chat/ChatBox"), { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" /> });
import WelcomeStatsSection from "../home/WelcomeStatsSection";
import OverallProgress from "../home/OverallProgress";
import ShortRoadmap from "../home/ShortRoadmap";

export default function DashboardContent() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isPending: isDashboardPending, isError } = useQuery({
    queryKey: ["dashboardData", session?.user?.id],
    queryFn: () => getDashboardOverview(),
    enabled: !!session?.user?.id,
  });

  if (isSessionLoading) {
    return <DashboardSkeleton />;
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  if (isDashboardPending && !data) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Dashboard Error</h3>
        <p className="text-muted-foreground">Failed to load dashboard overview. Please try refreshing.</p>
      </div>
    );
  }

  // Use optional chaining with fallback for smooth background refetches and safety
  const d = data || ({} as NonNullable<typeof data>);

  return (
    <div className="flex flex-col gap-5 pb-4 animate-in fade-in duration-500">
      {d.readiness && <WelcomeStatsSection readiness={d.readiness} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-auto lg:col-span-1">
          <div className="flex flex-col gap-6 h-full">
            {d.readiness && d.career && <OverallProgress value={d.readiness.score} role={d.career.targetRole} />}
          </div>
        </div>
        <div className="col-auto lg:col-span-1 h-full flex">
          <div className="w-full h-full flex-1">
            {d.nextAction && <NextBestActionCard data={d.nextAction} />}
          </div>
        </div>
        <div className="col-auto lg:col-span-1 h-full flex">
          <div className="w-full h-full flex-1">
            {d.roadmap && <ShortRoadmap data={d.roadmap} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {d.learningDebt && <LearningDebtCard data={d.learningDebt} />}
        {d.skills && <SkillHealthCard data={d.skills} />}
        {d.weeklyProgress && <WeeklyProgressCard data={d.weeklyProgress} />}
        {d.assessments && <AssessmentProgressCard data={d.assessments} />}
      </div>

      <div className="grid grid-cols-1 gap-6 mt-4">
        <ChatBox />
      </div>
    </div>
  );
}
