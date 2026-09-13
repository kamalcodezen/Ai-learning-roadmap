"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BrainCircuit,
  Check,
  Clock3,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";

import {
  getCareerDecision,
  getEvidenceVerification,
} from "@/src/lib/api/learner/career-intelligence";

import { getApplicationReadiness } from "@/src/lib/api/learner/application-readiness";
import { getCareerAlignment } from "@/src/lib/api/learner/career-alignment";

import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import { DashboardButton } from "@/src/components/dashboard/shared/patterns";

import SectionLabel from "./SectionLabel";
import StatusPill from "./StatusPill";
import MetricSignal from "./MetricSignal";
import ScoreBar from "./ScoreBar";
import QualityBadge from "./QualityBadge";
import FreshnessBadge from "./FreshnessBadge";
import ReadinessMetric from "./ReadinessMetric";
import CareerGate from "./CareerGate";

import {
  getDecisionMeta,
  getQualityMeta,
} from "./shared/meta";
import { toneStyles } from "./shared/tones";
import type { ReadinessDimension } from "./shared/types";

export default function CareerIntelligenceCard() {
  const { data: session } = useDashboardSession();

  const [showAllEvidence, setShowAllEvidence] = useState(false);

  const {
    data: decisionData,
    isLoading: isDecisionLoading,
    isError: isDecisionError,
    refetch: refetchDecision,
  } = useQuery({
    queryKey: ["careerDecision", session?.user?.id],
    queryFn: () => getCareerDecision(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: verificationData,
    isLoading: isVerificationLoading,
    isError: isVerificationError,
    refetch: refetchVerification,
  } = useQuery({
    queryKey: ["evidenceVerification", session?.user?.id],
    queryFn: () => getEvidenceVerification(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: readinessData } = useQuery({
    queryKey: ["applicationReadiness", session?.user?.id],
    queryFn: () => getApplicationReadiness(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: alignmentData } = useQuery({
    queryKey: ["careerAlignment", session?.user?.id],
    queryFn: () => getCareerAlignment(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  /* =========================================================
     LOADING
  ========================================================= */

  if (isDecisionLoading || isVerificationLoading) {
    return (
      <DashboardCard className="overflow-hidden p-0!">
        <div className="border-b border-border px-6 py-5">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-7 w-72 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="p-6 space-y-6">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </DashboardCard>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    isDecisionError ||
    isVerificationError ||
    !decisionData ||
    !verificationData
  ) {
    return (
      <DashboardCard className="overflow-hidden">
        <div className="flex flex-col items-start gap-4 border-l-2 border-destructive p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-bold">
              Career Intelligence Unavailable
            </h3>
          </div>

          <p className="max-w-2xl text-xs leading-6 text-muted-foreground">
            Unable to generate decision analytics at this moment. Ensure your
            profile and diagnostic are completed.
          </p>

          <DashboardButton
            text="Retry Analytics"
            radius="md"
            size="sm"
            onClick={() => {
              refetchDecision();
              refetchVerification();
            }}
          />
        </div>
      </DashboardCard>
    );
  }

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const decisionMeta = getDecisionMeta(decisionData.decision);
  const DecisionIcon = decisionMeta.icon;

  const overallReadiness =
    readinessData?.overallScore ?? decisionData.readinessScore;

  const evidenceConfidence =
    typeof verificationData.evidenceConfidence === "number"
      ? verificationData.evidenceConfidence
      : 65;

  const evidenceQuality =
    verificationData.evidenceQuality ||
    (verificationData.strongEvidenceSkillsCount > 0
      ? "STRONG"
      : "MODERATE");

  const evidenceFreshness =
    verificationData.evidenceFreshness ||
    (verificationData.staleEvidenceSkillsCount === 0
      ? "FRESH"
      : "MODERATE");

  const dimensions: ReadinessDimension[] = [
    {
      label: "Overall",
      value: `${overallReadiness}%`,
      score: overallReadiness,
      highlighted: true,
      icon: <Award className="h-3 w-3 text-primary" />,
    },

    {
      label: "Knowledge",
      value:
        readinessData?.dimensions?.knowledgeProficiency !== undefined &&
        readinessData?.dimensions?.knowledgeProficiency !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.knowledgeProficiency}%`
          : verificationData.overallSkillScore
            ? `${verificationData.overallSkillScore}%`
            : "—",
      score:
        readinessData?.dimensions?.knowledgeProficiency !== undefined &&
        readinessData?.dimensions?.knowledgeProficiency !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.knowledgeProficiency)
          : verificationData.overallSkillScore,
      icon: <BrainCircuit className="h-3 w-3 text-blue-500" />,
    },

    {
      label: "Practical",
      value:
        readinessData?.dimensions?.practicalCompetence !== undefined &&
        readinessData?.dimensions?.practicalCompetence !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.practicalCompetence}%`
          : "—",
      score:
        readinessData?.dimensions?.practicalCompetence !== undefined &&
        readinessData?.dimensions?.practicalCompetence !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.practicalCompetence)
          : null,
      icon: <Zap className="h-3 w-3 text-emerald-500" />,
    },

    {
      label: "Execution",
      value:
        readinessData?.dimensions?.projectExecution !== undefined &&
        readinessData?.dimensions?.projectExecution !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.projectExecution}%`
          : "—",
      score:
        readinessData?.dimensions?.projectExecution !== undefined &&
        readinessData?.dimensions?.projectExecution !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.projectExecution)
          : null,
      icon: <ShieldCheck className="h-3 w-3 text-purple-500" />,
    },

    {
      label: "Problem Solving",
      value:
        readinessData?.dimensions?.problemSolving !== undefined &&
        readinessData?.dimensions?.problemSolving !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.problemSolving}%`
          : "—",
      score:
        readinessData?.dimensions?.problemSolving !== undefined &&
        readinessData?.dimensions?.problemSolving !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.problemSolving)
          : null,
      icon: <Target className="h-3 w-3 text-red-500" />,
    },

    {
      label: "Communication",
      value:
        readinessData?.dimensions?.communication !== undefined &&
        readinessData?.dimensions?.communication !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.communication}%`
          : "—",
      score:
        readinessData?.dimensions?.communication !== undefined &&
        readinessData?.dimensions?.communication !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.communication)
          : null,
      icon: <HelpCircle className="h-3 w-3 text-sky-500" />,
    },

    {
      label: "Interview",
      value:
        readinessData?.dimensions?.interviewPreparedness !== undefined &&
        readinessData?.dimensions?.interviewPreparedness !== "NOT_ASSESSED"
          ? `${readinessData.dimensions.interviewPreparedness}%`
          : "—",
      score:
        readinessData?.dimensions?.interviewPreparedness !== undefined &&
        readinessData?.dimensions?.interviewPreparedness !== "NOT_ASSESSED"
          ? Number(readinessData.dimensions.interviewPreparedness)
          : null,
      icon: <Award className="h-3 w-3 text-amber-500" />,
    },
  ];

  const allSkills = verificationData.skills || [];
  const visibleSkills = showAllEvidence ? allSkills : allSkills.slice(0, 3);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      <DashboardCard className="overflow-hidden p-0!">
        <div className="relative border-b border-border px-6 py-7 md:px-8">
          <div className="absolute right-0 top-0 h-full w-1/3 pointer-events-none opacity-60">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel icon={<BrainCircuit className="h-3.5 w-3.5" />}>
                Career Intelligence
              </SectionLabel>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                  Your career position
                </h2>

                <StatusPill tone={decisionMeta.tone}>
                  <DecisionIcon className="h-3 w-3" />
                  {decisionMeta.label}
                </StatusPill>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                AI-powered readiness intelligence for{" "}
                <span className="font-semibold text-foreground">
                  {decisionData.targetRole}
                </span>
                .
                {typeof alignmentData?.matchPercentage === "number" && (
                  <>
                    {" "}
                    Your current profile shows{" "}
                    <span className="font-semibold text-primary">
                      {alignmentData.matchPercentage}%
                    </span>{" "}
                    market alignment.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden h-14 w-px bg-border lg:block" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Career Readiness
                </p>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-primary">
                    {overallReadiness}
                  </span>

                  <span className="text-sm font-bold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          <div className="bg-card p-5">
            <MetricSignal
              label="Skill Score"
              value={`${verificationData.overallSkillScore}%`}
              description="Your assessed technical knowledge."
              icon={<BrainCircuit className="h-3.5 w-3.5" />}
              tone="blue"
            />
          </div>

          <div className="bg-card p-5">
            <MetricSignal
              label="Proof Score"
              value={`${verificationData.overallProofScore}%`}
              description="Verified implementation evidence."
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              tone="green"
            />
          </div>

          <div className="bg-card p-5">
            <MetricSignal
              label="Employer Signal"
              value={`${verificationData.employerConfidenceSignal}%`}
              description="Estimated hiring confidence."
              icon={<Award className="h-3.5 w-3.5" />}
              tone="purple"
            />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0!">
        <div className="grid lg:grid-cols-[1fr_0.75fr]">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-8">
            <SectionLabel icon={<Zap className="h-3.5 w-3.5" />}>
              Highest Impact Next Action
            </SectionLabel>

            <div className="mt-5 flex flex-col gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {decisionData.nextBestAction.title}
                  </h3>

                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-primary">
                    {decisionData.nextBestAction.expectedImpact} impact
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Focus area:{" "}
                  <span className="font-semibold text-foreground">
                    {decisionData.nextBestAction.skillName}
                  </span>{" "}
                  · Current score{" "}
                  <span className="font-semibold text-foreground">
                    {decisionData.nextBestAction.currentScore}%
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  Estimated effort:{" "}
                  <span className="font-semibold text-foreground">
                    ~{decisionData.nextBestAction.estimatedEffortHours} hrs
                  </span>
                </div>

                <DashboardButton
                  href={decisionData.nextBestAction.actionUrl}
                  text={
                    <>
                      Start Action
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  }
                  size="sm"
                  radius="lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/[0.22] p-6 lg:p-8">
            <SectionLabel icon={<HelpCircle className="h-3.5 w-3.5" />}>
              Why this action?
            </SectionLabel>

            <div className="mt-5 space-y-3">
              {decisionData.why.map((reason, index) => (
                <div
                  key={`reason-${index}`}
                  className="flex gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </span>

                  <p className="text-xs leading-5 text-foreground/80">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-border bg-primary/[0.025] p-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="max-w-2xl">
            <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
              What-if projection
            </SectionLabel>

            <p className="mt-2 text-xs font-medium leading-5 text-foreground">
              {decisionData.simulation.scenarioText}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
              {decisionData.simulation.disclaimer}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Proof Gain
              </p>
              <p className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">
                +{decisionData.simulation.projectedProofScoreGain}%
              </p>
            </div>

            <div className="h-9 w-px bg-border" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Readiness Gain
              </p>
              <p className="mt-1 text-lg font-black text-blue-600 dark:text-blue-400">
                +{decisionData.simulation.projectedReadinessGain}%
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0!">
        <div className="border-b border-border px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel icon={<BarChart3 className="h-3.5 w-3.5" />}>
                Evidence Analysis
              </SectionLabel>

              <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                Skill vs proof
              </h3>

              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                The difference between what you know and what you can prove
                through real implementation.
              </p>
            </div>

            <div className="flex items-center gap-3 border-l-2 border-primary pl-4">
              <Award className="h-5 w-5 text-primary" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  Employer Confidence
                </p>

                <p className="text-xl font-black text-primary">
                  {verificationData.employerConfidenceSignal}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-2">
          <div className="bg-card p-6 md:p-8">
            <ScoreBar
              label="Knowledge Score"
              score={verificationData.overallSkillScore}
              tone="blue"
              description="Claimed and assessed technical competence"
            />
          </div>

          <div className="bg-card p-6 md:p-8">
            <ScoreBar
              label="Verified Proof Score"
              score={verificationData.overallProofScore}
              tone="green"
              description="Evidence from verified projects and output"
            />
          </div>
        </div>

        <div className="border-t border-border p-6 md:p-8">
          <div className="flex flex-col gap-1">
            <SectionLabel icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Evidence Matrix
            </SectionLabel>

            <p className="text-xs text-muted-foreground">
              Skill-level verification, freshness and supporting project proof.
            </p>
          </div>

          <div className="mt-5 grid dashboard-card-gap sm:grid-cols-2 lg:grid-cols-3">
            {visibleSkills.map((item) => {
              const qualityStyle =
                toneStyles[getQualityMeta(item.quality).tone];

              return (
                <div
                  key={item.skillName}
                  className="group border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="min-w-0 truncate text-sm font-bold text-foreground">
                      {item.skillName}
                    </h4>

                    <QualityBadge quality={item.quality} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 dashboard-card-gap">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        Knowledge
                      </p>

                      <p className="mt-1 text-base font-black text-foreground">
                        {item.skillScore}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        Proof
                      </p>

                      <p className="mt-1 text-base font-black text-emerald-600 dark:text-emerald-400">
                        {item.proofScore}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${qualityStyle.dot}`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(item.proofScore, 100),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <FreshnessBadge freshness={item.freshness} />

                    <span className="text-[10px] text-muted-foreground">
                      {item.evidenceSources.verifiedProjectsCount} verified
                      project
                      {item.evidenceSources.verifiedProjectsCount === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  {item.recommendation && (
                    <div className="mt-3 border-l-2 border-amber-500 bg-amber-500/[0.06] px-3 py-2">
                      <p className="text-[10px] leading-4 text-amber-700 dark:text-amber-300">
                        {item.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {allSkills.length > 3 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllEvidence((prev) => !prev)}
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-full border px-5 py-2",
                  "text-xs font-semibold",
                  "border-primary/20 bg-primary/10 text-primary",
                  "transition-colors duration-200",
                  "hover:bg-primary/15",
                ].join(" ")}
              >
                {showAllEvidence ? "Show Less" : "View All"}
                <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-200 ${showAllEvidence ? "rotate-90" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0!">
        <div className="border-b border-border px-6 py-6 md:px-8">
          <SectionLabel icon={<Target className="h-3.5 w-3.5" />}>
            Readiness System
          </SectionLabel>

          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Seven dimensions of career readiness
              </h3>

              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                A unified view of the signals that determine your current
                position in the career pipeline.
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Canonical evaluation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4 lg:grid-cols-7">
          {dimensions.map((dimension) => (
            <div key={dimension.label} className="bg-card p-3">
              <ReadinessMetric dimension={dimension} />
            </div>
          ))}
        </div>

        <div className="border-t border-border p-6 md:p-8">
          <SectionLabel icon={<Sparkles className="h-3.5 w-3.5" />}>
            Evidence intelligence signals
          </SectionLabel>

          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
            <div className="bg-card p-4">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Skill Score
              </p>

              <p className="mt-2 text-lg font-black text-foreground">
                {verificationData.overallSkillScore}%
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Claimed knowledge
              </p>
            </div>

            <div className="bg-card p-4">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Proof Score
              </p>

              <p className="mt-2 text-lg font-black text-emerald-600 dark:text-emerald-400">
                {verificationData.overallProofScore}%
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Verified implementation
              </p>
            </div>

            <div className="bg-card p-4">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Evidence Quality
              </p>

              <div className="mt-2">
                <QualityBadge quality={evidenceQuality} />
              </div>

              <p className="mt-2 text-[9px] text-muted-foreground">
                {verificationData.strongEvidenceSkillsCount} strong skill(s)
              </p>
            </div>

            <div className="bg-card p-4">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Confidence
              </p>

              <p className="mt-2 text-lg font-black text-foreground">
                {evidenceConfidence}%
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Multi-source validity
              </p>
            </div>

            <div className="bg-card p-4">
              <p className="text-[10px] font-semibold text-muted-foreground">
                Freshness
              </p>

              <div className="mt-2">
                <FreshnessBadge freshness={evidenceFreshness} />
              </div>

              <p className="mt-2 text-[9px] text-muted-foreground">
                {verificationData.staleEvidenceSkillsCount} stale skill(s)
              </p>
            </div>

            <div className="bg-primary/[0.06] p-4">
              <p className="text-[10px] font-semibold text-primary">
                Employer Signal
              </p>

              <p className="mt-2 text-lg font-black text-primary">
                {verificationData.employerConfidenceSignal}%
              </p>

              <p className="mt-1 text-[9px] text-muted-foreground">
                Hiring readiness
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

      <CareerGate
        decision={decisionData.decision}
        targetRole={decisionData.targetRole}
        readinessScore={overallReadiness}
        proofScore={verificationData.overallProofScore}
        skillScore={verificationData.overallSkillScore}
        nextActionUrl={decisionData.nextBestAction?.actionUrl}
        nextActionTitle={decisionData.nextBestAction?.title}
      />
    </div>
  );
}