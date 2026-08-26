import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";
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

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/");
  }

  let data: DashboardData;
  try {
    data = await getDashboardOverview(session.user.id);
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Dashboard Error</h3>
        <p className="text-muted-foreground">Failed to load your dashboard. Please try refreshing the page.</p>
      </div>
    );
  }

  // Use session user if available, otherwise mock data user
  const userToPass = {
    name: session.user.name || data.user.name,
    image: session.user.image || data.user.image,
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
