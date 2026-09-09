import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { CareerDecisionStatus } from "@/src/lib/api/learner/career-intelligence";

import { DashboardCard } from "@/src/components/dashboard/shared/cards";

import { toneStyles, type Tone } from "../shared/tones";

export default function CareerGate({
  decision,
  targetRole,
  readinessScore,
  proofScore,
  skillScore,
  nextActionUrl,
  nextActionTitle,
}: {
  decision: CareerDecisionStatus;
  targetRole: string;
  readinessScore: number;
  proofScore: number;
  skillScore: number;
  nextActionUrl?: string;
  nextActionTitle?: string;
}) {
  const config = {
    APPLY_NOW: {
      eyebrow: "Career Gate Passed",
      title: "You are ready for the market.",
      description: (
        <>
          Your readiness score, verified evidence and interview proficiency
          indicate that you have crossed the current career threshold for{" "}
          <strong className="text-foreground">{targetRole}</strong>.
        </>
      ),
      icon: Rocket,
      tone: "green" as Tone,
      action: "View Job Reality",
      href: "/dashboard/learner/job-reality",
      scoreLabel: "Career Ready",
      score: readinessScore,
    },

    PREPARE_THEN_APPLY: {
      eyebrow: "Preparation Required",
      title: "You are close. Finish the final gaps.",
      description: (
        <>
          Your competence baseline is established for{" "}
          <strong className="text-foreground">{targetRole}</strong>. Targeted
          interview practice or specific knowledge gaps should be addressed
          before applying.
        </>
      ),
      icon: Sparkles,
      tone: "blue" as Tone,
      action: nextActionTitle || "Start Preparation",
      href: nextActionUrl || "/dashboard/learner/interview",
      scoreLabel: "Preparation Phase",
      score: readinessScore,
    },

    BUILD_MORE_EVIDENCE: {
      eyebrow: "Evidence Gap Detected",
      title: "Your knowledge needs stronger proof.",
      description: (
        <>
          Your theoretical skill score is{" "}
          <strong className="text-foreground">{skillScore}%</strong>, but
          verified portfolio proof is currently{" "}
          <strong className="text-foreground">{proofScore}%</strong>. Build
          and submit stronger project evidence before moving to the application
          stage.
        </>
      ),
      icon: ShieldCheck,
      tone: "amber" as Tone,
      action: "Build Project Evidence",
      href: "/dashboard/learner/portfolio",
      scoreLabel: "Proof Score",
      score: proofScore,
    },

    NOT_READY: {
      eyebrow: "Foundation Stage",
      title: "Build your foundation first.",
      description: (
        <>
          You are currently in the foundational skill-building phase for{" "}
          <strong className="text-foreground">{targetRole}</strong>. Complete
          your diagnostic baseline and work through your roadmap milestones.
        </>
      ),
      icon: BrainCircuit,
      tone: "purple" as Tone,
      action: nextActionTitle || "Start Diagnostic",
      href: nextActionUrl || "/diagnostic",
      scoreLabel: "Foundation Phase",
      score: readinessScore,
    },
  }[decision];

  const style = toneStyles[config.tone];
  const Icon = config.icon;

  return (
    <DashboardCard className="overflow-hidden p-0!">
      <div className={`border-l-4 ${style.border} ${style.soft}`}>
        <div className="flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-3xl">
            <div className={`flex items-center gap-2 ${style.text}`}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                {config.eyebrow}
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">
              {config.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {config.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
            <div className="text-left md:text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {config.scoreLabel}
              </p>
              <div className={`mt-1 text-4xl font-black ${style.text}`}>
                {config.score}%
              </div>
            </div>

            <Link
              href={config.href}
              className={[
                "inline-flex items-center justify-center gap-2",
                "rounded-lg bg-primary px-4 py-2.5",
                "text-sm font-bold text-white",
                "transition-colors duration-200",
                "hover:bg-secondary",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary/40",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",
              ].join(" ")}
            >
              {config.action}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}