"use client";

import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getCareerDecision,
  getEvidenceVerification,
  CareerDecisionStatus,
  EvidenceQuality,
  EvidenceFreshness,
} from "@/src/lib/api/learner/career-intelligence";
import { getApplicationReadiness } from "@/src/lib/api/learner/application-readiness";
import { getCareerAlignment } from "@/src/lib/api/learner/career-alignment";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/src/components/ui/Card";
import { DashboardCard } from "../dashboard-card";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Target,
  Star,
  Rocket,
} from "lucide-react";

export default function CareerIntelligenceCard() {
  const { data: session } = useDashboardSession();

  const {
    data: decisionData,
    isLoading: isDecisionLoading,
    isError: isDecisionError,
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
  } = useQuery({
    queryKey: ["evidenceVerification", session?.user?.id],
    queryFn: () => getEvidenceVerification(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Step 22 — Final Career Readiness unified data
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

  if (isDecisionLoading || isVerificationLoading) {
    return (
      <DashboardCard className="animate-pulse p-6">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-20 bg-muted/60 rounded" />
      </DashboardCard>
    );
  }

  if (isDecisionError || isVerificationError || !decisionData || !verificationData) {
    return (
      <DashboardCard className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3 text-destructive font-semibold mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Career Intelligence Unavailable</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Unable to generate decision analytics at this moment. Ensure your profile and diagnostic are completed.
        </p>
      </DashboardCard>
    );
  }

  const getDecisionBadge = (status: CareerDecisionStatus) => {
    switch (status) {
      case "APPLY_NOW":
        return {
          label: "Ready to Apply",
          color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "PREPARE_THEN_APPLY":
        return {
          label: "Prepare & Apply",
          color: "bg-blue-500/15 text-blue-600 border-blue-500/30",
          icon: Sparkles,
        };
      case "BUILD_MORE_EVIDENCE":
        return {
          label: "Build More Evidence",
          color: "bg-amber-500/15 text-amber-600 border-amber-500/30",
          icon: ShieldCheck,
        };
      default:
        return {
          label: "Build Core Skills",
          color: "bg-purple-500/15 text-purple-600 border-purple-500/30",
          icon: BrainCircuit,
        };
    }
  };

  const badge = getDecisionBadge(decisionData.decision);
  const BadgeIcon = badge.icon;

  const getQualityBadge = (quality: EvidenceQuality) => {
    switch (quality) {
      case "STRONG":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">STRONG</span>;
      case "MODERATE":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600">MODERATE</span>;
      case "WEAK":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">WEAK</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">UNVERIFIED</span>;
    }
  };

  const getFreshnessBadge = (freshness: EvidenceFreshness) => {
    switch (freshness) {
      case "FRESH":
        return <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Fresh</span>;
      case "STALE":
        return <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Stale</span>;
      default:
        return <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Moderate</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & DECISION SIGNAL */}
      <DashboardCard className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">AI Career Decision Engine</h2>
              </div>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                <span>Data-driven decision analytics for <span className="font-semibold text-foreground">{decisionData.targetRole}</span></span>
                {alignmentData && typeof alignmentData.matchPercentage === "number" && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {alignmentData.matchPercentage}% Market Alignment
                  </span>
                )}
              </p>
            </div>

            {/* Decision Status Badge */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${badge.color}`}>
              <BadgeIcon className="w-4 h-4" />
              <span>{badge.label}</span>
            </div>
          </div>

          {/* NEXT BEST ACTION & RATIONALE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 border-primary/30 bg-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Highest Impact Next Action
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  {decisionData.nextBestAction.expectedImpact} IMPACT
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">{decisionData.nextBestAction.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Skill Focus: <span className="font-semibold text-foreground">{decisionData.nextBestAction.skillName}</span> (Current Score: {decisionData.nextBestAction.currentScore}%)
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-primary/20 text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Estimated effort: ~{decisionData.nextBestAction.estimatedEffortHours} hrs
                </span>
                <Link
                  href={decisionData.nextBestAction.actionUrl}
                  className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 hover:bg-primary/90 transition-all"
                >
                  Start Action <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* WHY THIS ACTION RATIONALE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" /> Why This Action?
              </h4>
              <ul className="space-y-2">
                {decisionData.why.map((reason, idx) => (
                  <li key={`why-${idx}`} className="text-xs text-foreground/90 flex items-start gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/40">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* WHAT-IF DECISION SIMULATOR */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> What-If Effort Projection
              </span>
              <p className="text-xs font-medium text-foreground">{decisionData.simulation.scenarioText}</p>
              <p className="text-[10px] text-muted-foreground italic">{decisionData.simulation.disclaimer}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Proof Gain</p>
                <p className="text-base font-bold text-emerald-600">+{decisionData.simulation.projectedProofScoreGain}%</p>
              </div>
              <div className="text-center border-l border-border pl-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Readiness Gain</p>
                <p className="text-base font-bold text-blue-600">+{decisionData.simulation.projectedReadinessGain}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </DashboardCard>

      {/* SKILL SCORE vs PROOF SCORE & EVIDENCE QUALITY */}
      <DashboardCard className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Skill Score vs. Proof Score Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">
              Comparing your claimed knowledge score against verified implementation proof
            </p>
          </div>

          {/* Employer Confidence Signal */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <Award className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employer Confidence Signal</p>
              <p className="text-lg font-bold text-primary">{verificationData.employerConfidenceSignal}%</p>
            </div>
          </div>
        </div>

        {/* Overview Comparison Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Overall Skill Knowledge Score</span>
              <span className="font-bold text-foreground">{verificationData.overallSkillScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${verificationData.overallSkillScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Overall Verified Proof Score</span>
              <span className="font-bold text-emerald-600">{verificationData.overallProofScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${verificationData.overallProofScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* SKILLS EVIDENCE VERIFIER LIST */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Per-Skill Evidence & Freshness Matrix
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {verificationData.skills.map((item) => (
              <Card key={item.skillName} className="p-4 border hover:border-primary/40 transition-all bg-card/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm text-foreground truncate">{item.skillName}</h5>
                  {getQualityBadge(item.quality)}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Knowledge Score:</span>
                    <span className="font-semibold text-foreground">{item.skillScore}%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Proof Score:</span>
                    <span className="font-semibold text-emerald-600">{item.proofScore}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                  {getFreshnessBadge(item.freshness)}
                  <span className="text-muted-foreground">{item.evidenceSources.verifiedProjectsCount} Verified Proj</span>
                </div>

                {item.recommendation && (
                  <p className="text-[10px] text-amber-600 bg-amber-500/10 p-2 rounded border border-amber-500/20 line-clamp-2">
                    {item.recommendation}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* ═══════════════════════════════════════════════════
           STEP 22 — FINAL CAREER READINESS UNIFIED VIEW
          ═══════════════════════════════════════════════════ */}
      <DashboardCard className="p-6 space-y-6 border-t-4 border-t-primary/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Final Career Readiness & Evidence Intelligence</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unified intelligence signals and canonical readiness dimensions for <span className="font-semibold text-foreground">{decisionData.targetRole}</span>
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary self-start md:self-auto">
            Canonical Evaluation
          </span>
        </div>

        {/* 1. REQUIRED EVIDENCE INTELLIGENCE SIGNALS (6 Signals) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> Evidence Intelligence Signals
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Skill Score */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-500" /> Skill Score
              </span>
              <span className="text-base font-bold text-foreground">
                {verificationData.overallSkillScore}%
              </span>
              <span className="text-[10px] text-muted-foreground">Claimed knowledge</span>
            </div>

            {/* 2. Proof Score */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Proof Score
              </span>
              <span className="text-base font-bold text-emerald-600">
                {verificationData.overallProofScore}%
              </span>
              <span className="text-[10px] text-muted-foreground">Verified code & output</span>
            </div>

            {/* 3. Evidence Quality */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Evidence Quality
              </span>
              <div>
                {getQualityBadge(verificationData.evidenceQuality || (verificationData.strongEvidenceSkillsCount > 0 ? "STRONG" : "MODERATE"))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {verificationData.strongEvidenceSkillsCount} strong skill(s)
              </span>
            </div>

            {/* 4. Evidence Confidence */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Evidence Confidence
              </span>
              <span className="text-base font-bold text-foreground">
                {typeof verificationData.evidenceConfidence === "number" ? `${verificationData.evidenceConfidence}%` : "65%"}
              </span>
              <span className="text-[10px] text-muted-foreground">Multi-source validity</span>
            </div>

            {/* 5. Evidence Freshness */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Evidence Freshness
              </span>
              <div>
                {getFreshnessBadge(verificationData.evidenceFreshness || (verificationData.staleEvidenceSkillsCount === 0 ? "FRESH" : "MODERATE"))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {verificationData.staleEvidenceSkillsCount} stale skill(s)
              </span>
            </div>

            {/* 6. Employer Confidence Signal */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Employer Signal
              </span>
              <span className="text-base font-bold text-primary">
                {verificationData.employerConfidenceSignal}%
              </span>
              <span className="text-[10px] text-muted-foreground">Hiring readiness</span>
            </div>
          </div>
        </div>

        {/* 2. CANONICAL READINESS DIMENSIONS (7 Dimensions) */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" /> 7 Canonical Readiness Dimensions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              {
                label: "Overall Readiness",
                value: readinessData ? `${readinessData.overallScore}%` : "—",
                good: readinessData ? readinessData.overallScore >= 70 : null,
                icon: <Star className="w-3.5 h-3.5 text-amber-500" />,
                highlight: true,
              },
              {
                label: "Knowledge",
                value: readinessData?.dimensions?.knowledgeProficiency !== undefined && readinessData?.dimensions?.knowledgeProficiency !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.knowledgeProficiency}%`
                  : verificationData?.overallSkillScore ? `${verificationData.overallSkillScore}%` : "Not Assessed",
                good: readinessData?.dimensions?.knowledgeProficiency !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.knowledgeProficiency || 0) >= 60,
                icon: <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />,
              },
              {
                label: "Practical",
                value: readinessData?.dimensions?.practicalCompetence !== undefined && readinessData?.dimensions?.practicalCompetence !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.practicalCompetence}%`
                  : "Not Assessed",
                good: readinessData?.dimensions?.practicalCompetence !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.practicalCompetence || 0) >= 60,
                icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />,
              },
              {
                label: "Project Execution",
                value: readinessData?.dimensions?.projectExecution !== undefined && readinessData?.dimensions?.projectExecution !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.projectExecution}%`
                  : "Not Assessed",
                good: readinessData?.dimensions?.projectExecution !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.projectExecution || 0) >= 60,
                icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />,
              },
              {
                label: "Problem Solving",
                value: readinessData?.dimensions?.problemSolving !== undefined && readinessData?.dimensions?.problemSolving !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.problemSolving}%`
                  : "Not Assessed",
                good: readinessData?.dimensions?.problemSolving !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.problemSolving || 0) >= 60,
                icon: <Target className="w-3.5 h-3.5 text-red-500" />,
              },
              {
                label: "Communication",
                value: readinessData?.dimensions?.communication !== undefined && readinessData?.dimensions?.communication !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.communication}%`
                  : "Not Assessed",
                good: readinessData?.dimensions?.communication !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.communication || 0) >= 60,
                icon: <HelpCircle className="w-3.5 h-3.5 text-sky-500" />,
              },
              {
                label: "Interview Prep",
                value: readinessData?.dimensions?.interviewPreparedness !== undefined && readinessData?.dimensions?.interviewPreparedness !== "NOT_ASSESSED"
                  ? `${readinessData.dimensions.interviewPreparedness}%`
                  : "Not Assessed",
                good: readinessData?.dimensions?.interviewPreparedness !== "NOT_ASSESSED" && Number(readinessData?.dimensions?.interviewPreparedness || 0) >= 60,
                icon: <Award className="w-3.5 h-3.5 text-amber-500" />,
              },
            ].map((dim, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 p-2.5 rounded-xl border text-center ${
                  dim.highlight
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  {dim.icon}
                  <span className="font-semibold truncate">{dim.label}</span>
                </div>
                <span
                  className={`text-sm font-bold truncate ${
                    dim.value === "Not Assessed" || dim.value === "—"
                      ? "text-muted-foreground text-xs"
                      : dim.good
                        ? "text-emerald-600"
                        : "text-foreground"
                  }`}
                >
                  {dim.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
             STEP 23: READY FOR CAREER GATE
             Represents real outcomes:
             - READY FOR CAREER (APPLY_NOW)
             - PREPARE_THEN_APPLY
             - BUILD_MORE_EVIDENCE
             - NOT_READY
            ═══════════════════════════════════════════════════ */}
        {decisionData && (
          <div className="pt-2 border-t border-border/50">
            {decisionData.decision === "APPLY_NOW" && (
              <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 flex flex-col md:flex-row items-center gap-5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Step 23 Gate Outcome
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                    <Rocket className="w-6 h-6" /> READY FOR CAREER
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Congratulations! All threshold requirements have been met. Your readiness score ({readinessData?.overallScore || decisionData.readinessScore}%), verified evidence, and interview proficiency demonstrate strong market alignment. You are ready to apply for <span className="font-semibold text-foreground">{decisionData.targetRole}</span> positions!
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-4xl font-black text-emerald-600">{readinessData?.overallScore || decisionData.readinessScore}%</div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Career Ready</div>
                  </div>
                  <Link
                    href="/dashboard/learner/job-reality"
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    View Job Reality <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {decisionData.decision === "PREPARE_THEN_APPLY" && (
              <div className="p-5 rounded-2xl border-2 border-blue-500/40 bg-blue-500/5 flex flex-col md:flex-row items-center gap-5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      Step 23 Gate Outcome
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" /> PREPARE THEN APPLY
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You have established a solid competence baseline for <span className="font-semibold text-foreground">{decisionData.targetRole}</span>. Complete your targeted interview practice or close specific knowledge gaps before sending applications.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-600">{readinessData?.overallScore || decisionData.readinessScore}%</div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Preparation Phase</div>
                  </div>
                  <Link
                    href={decisionData.nextBestAction?.actionUrl || "/dashboard/learner/interview"}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    {decisionData.nextBestAction?.title || "Start Preparation"} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {decisionData.decision === "BUILD_MORE_EVIDENCE" && (
              <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 flex flex-col md:flex-row items-center gap-5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Step 23 Gate Outcome
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" /> BUILD MORE EVIDENCE
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    High theoretical skill competence detected ({verificationData.overallSkillScore}%), but verified portfolio proof ({verificationData.overallProofScore}%) is insufficient for employers. Build and submit verified project implementations to pass the career gate.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-black text-amber-600">{verificationData.overallProofScore}%</div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Proof Deficit</div>
                  </div>
                  <Link
                    href="/dashboard/learner/portfolio"
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    Build Project Evidence <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {decisionData.decision === "NOT_READY" && (
              <div className="p-5 rounded-2xl border-2 border-purple-500/40 bg-purple-500/5 flex flex-col md:flex-row items-center gap-5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300">
                      Step 23 Gate Outcome
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6" /> NOT READY
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You are in the foundational skill-building phase for <span className="font-semibold text-foreground">{decisionData.targetRole}</span>. Complete your diagnostic baseline assessment and work through your milestone roadmap to build required skills.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-600">{readinessData?.overallScore || decisionData.readinessScore}%</div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Foundation Phase</div>
                  </div>
                  <Link
                    href={decisionData.nextBestAction?.actionUrl || "/diagnostic"}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    {decisionData.nextBestAction?.title || "Start Diagnostic"} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
