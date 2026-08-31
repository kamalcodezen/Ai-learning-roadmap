"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { getDashboardOverview } from "@/src/lib/api/learner/dashboard";
import { useQuery } from "@tanstack/react-query";
import DashboardSkeleton from "./DashboardSkeleton";
import {  } from "../../shared/types";
import NextBestActionCard from "../NextBestActionCard";
import LearningDebtCard from "../LearningDebtCard";
import SkillHealthCard from "../SkillHealthCard";
import WeeklyProgressCard from "../WeeklyProgressCard";
import AssessmentProgressCard from "../AssessmentProgressCard";
import ChatBox from "@/src/components/chat/ChatBox";
import WelcomeStatsSection from "../home/WelcomeStatsSection"
import OverallProgress from "../home/OverallProgress"
import ShortRoadmap from "../home/ShortRoadmap";

export default function DashboardContent() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data, isLoading, isError } = useQuery({
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Dashboard Error</h3>
        <p className="text-muted-foreground">Failed to load your dashboard. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-4 animate-in fade-in duration-500">
      <WelcomeStatsSection readiness={data.readiness} />

      {/* High Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-auto lg:col-span-1  ">
          <div className="flex flex-col gap-6 h-full">
            <OverallProgress value={data.readiness.score} role={data.career.targetRole} />
          </div>
        </div>
        <div className="col-auto lg:col-span-1  h-full flex">
          <div className="w-full h-full flex-1">
            <NextBestActionCard data={data.nextAction} />
          </div>
        </div>
        <div className="col-auto lg:col-span-1 h-full flex">
          <div className="w-full h-full flex-1">
            <ShortRoadmap data={data.roadmap} />
          </div>
        </div>
      </div>

      {/* Main Grid for Medium & Lower Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Row 2 */}
        <LearningDebtCard data={data.learningDebt} />
        <SkillHealthCard data={data.skills} />
        <WeeklyProgressCard data={data.weeklyProgress} />
        <AssessmentProgressCard data={data.assessments} />

      </div>

      {/* Dedicated AI Copilot Section */}
      <div className="grid grid-cols-1 gap-6 mt-4">
        <ChatBox />
      </div>
    </div>
  );
}
