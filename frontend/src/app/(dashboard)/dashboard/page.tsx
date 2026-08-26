"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { getDashboardOverview } from "@/src/lib/api/dashboard";
import { DashboardData } from "@/src/components/dashboard/types";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import CareerReadinessCard from "@/src/components/dashboard/CareerReadinessCard";
import NextBestActionCard from "@/src/components/dashboard/NextBestActionCard";
import RoadmapPreview from "@/src/components/dashboard/RoadmapPreview";
import LearningDebtCard from "@/src/components/dashboard/LearningDebtCard";
import SkillHealthCard from "@/src/components/dashboard/SkillHealthCard";
import WeeklyProgressCard from "@/src/components/dashboard/WeeklyProgressCard";
import AssessmentProgressCard from "@/src/components/dashboard/AssessmentProgressCard";
import SkillProofPreview from "@/src/components/dashboard/SkillProofPreview";
import CareerAlignmentCard from "@/src/components/dashboard/CareerAlignmentCard";
import ApplicationReadinessCard from "@/src/components/dashboard/ApplicationReadinessCard";
import ChatBox from "@/src/components/chat/ChatBox";
import PortfolioStrengthCard from "@/src/components/dashboard/PortfolioStrengthCard";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataPending, setDataPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!session?.user.id) return;
      try {
        setError(null);
        const dashboardData = await getDashboardOverview(session.user.id);
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setError("Failed to load your dashboard. Please try refreshing the page.");
      } finally {
        setDataPending(false);
      }
    }
    
    if (!sessionPending) {
      loadData();
    }
  }, [session?.user.id, sessionPending]);
  
  const isPending = sessionPending || dataPending;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Dashboard Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Retry
        </button>
      </div>
    );
  }

  if (isPending || !data) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Skeleton className="h-[400px] col-span-1" />
          <Skeleton className="h-[400px] col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2" />
          <Skeleton className="h-[400px] col-span-1" />
        </div>
      </div>
    );
  }

  // Use session user if available, otherwise mock data user
  const userToPass = {
    name: session?.user.name || data.user.name,
    image: session?.user.image || data.user.image,
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <DashboardHeader user={userToPass} career={data.career} />
      
      {/* High Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="col-span-1">
          <CareerReadinessCard data={data.readiness} role={data.career.targetRole} />
        </div>
        <div className="col-span-1 lg:col-span-2 xl:col-span-2 h-full flex">
          <div className="w-full h-full flex-1">
            <NextBestActionCard data={data.nextAction} />
          </div>
        </div>
        <div className="col-span-1 h-full flex">
          <div className="w-full h-full flex-1">
            <RoadmapPreview data={data.roadmap} />
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
        
        {/* Row 3 */}
        <CareerAlignmentCard data={data.careerAlignment} />
        <SkillProofPreview data={data.proof} />
        <ApplicationReadinessCard data={data.applicationReadiness} />
        <PortfolioStrengthCard data={data.portfolio} />
      </div>

      {/* Dedicated AI Copilot Section */}
      <div className="grid grid-cols-1 gap-6 mt-4">
        <ChatBox />
      </div>
    </div>
  );
}
