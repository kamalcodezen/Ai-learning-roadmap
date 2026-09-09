"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SkillSimulationView from "@/src/components/dashboard/learner/assessments/SkillSimulationView";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

function SimulationContent() {
  const searchParams = useSearchParams();
  const rawSkill = searchParams?.get("skill")?.trim() || "";
  const isReview = searchParams?.get("review") === "true";

  if (!rawSkill) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center max-w-md mx-auto">
        <Target className="w-10 h-10 text-primary" />
        <h2 className="text-xl font-bold text-foreground">No Skill Specified</h2>
        <p className="text-sm text-muted-foreground">
          Please select a skill from your assessments page to begin a targeted mastery simulation.
        </p>
        <Link
          href="/dashboard/learner/assessments"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Assessments
        </Link>
      </div>
    );
  }

  return <SkillSimulationView skill={rawSkill} initialReviewMode={isReview} />;
}

export default function SimulationPage() {
  return (
    <Suspense fallback={<GenericPageSkeleton />}>
      <SimulationContent />
    </Suspense>
  );
}
