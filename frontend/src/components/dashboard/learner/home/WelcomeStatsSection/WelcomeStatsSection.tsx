"use client";

import { Target } from "lucide-react";

import { authClient } from "@/src/lib/auth-client";
import {
  DashboardBanner,
  type DashboardBannerStat,
} from "@/src/components/dashboard/shared/banner/DashboardBanner";
import type { DashboardData } from "../../../shared/types";

interface WelcomeStatsSectionProps {
  readiness?: DashboardData["readiness"];
  career?: DashboardData["career"];
  kpis?: DashboardData["kpis"];
  roadmap?: DashboardData["roadmap"];
  proof?: DashboardData["proof"];
}

export default function WelcomeStatsSection({
  readiness,
  career,
  kpis,
  roadmap,
  proof,
}: WelcomeStatsSectionProps) {
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.trim().split(" ")[0] || "there";

  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const targetRole = kpis?.targetRole || career?.targetRole || "";

  const resolveKpiValue = (val: number | null | undefined): number | string => {
    if (typeof val === "number" && !isNaN(val)) {
      return val;
    }
    return "Not enough data yet";
  };

  const stats: DashboardBannerStat[] = [
    {
      value: resolveKpiValue(kpis?.careerReadiness ?? readiness?.score),
      label: "Career Readiness",
      subtext: "Authoritative readiness score",
    },
    {
      value: resolveKpiValue(kpis?.skillProgress ?? proof?.overallSkillScore),
      label: "Skill Progress",
      subtext: "Verified skill proficiency",
    },
    {
      value: resolveKpiValue(kpis?.learningProgress ?? roadmap?.progress),
      label: "Learning Progress",
      subtext: "Roadmap milestone completion",
    },
    {
      value: resolveKpiValue(kpis?.proofStrength ?? proof?.overallProofScore),
      label: "Proof Strength",
      subtext: "Verified project evidence",
    },
  ];

  return (
    <DashboardBanner
      title={
        <>
          Welcome back, <span className="text-secondary">{capitalizedFirstName}</span>
        </>
      }
      subtitle="Here&apos;s an authoritative overview of your career readiness and learning progress."
      stats={stats}
      rightSlot={
        targetRole ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm shadow-xs">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Target Career:</span>
            <span className="font-bold text-foreground">{targetRole}</span>
          </div>
        ) : undefined
      }
    />
  );
}