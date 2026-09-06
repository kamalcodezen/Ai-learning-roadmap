"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getCareerAlignment } from "@/src/lib/api/learner/career-alignment";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import {
  DashboardButton,
  PageHeader,
  StatusBadge,
} from "@/src/components/dashboard/shared/patterns";
import { CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  CheckCircle2,
  Target,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Compass,
  CircleDot,
} from "lucide-react";

const alignmentMeta = (percentage: number) => {
  if (percentage >= 70) {
    return { tone: "green" as const, label: "Strong Alignment" };
  }
  if (percentage >= 40) {
    return { tone: "blue" as const, label: "Developing" };
  }
  return { tone: "orange" as const, label: "Needs Work" };
};

const importanceTone: Record<
  "High" | "Medium" | "Low",
  "red" | "orange" | "gray"
> = {
  High: "red",
  Medium: "orange",
  Low: "gray",
};

const statusBadges: Record<
  "acquired" | "learning" | "missing",
  { tone: "green" | "blue" | "red"; label: string }
> = {
  acquired: { tone: "green", label: "Acquired" },
  learning: { tone: "blue", label: "In Progress" },
  missing: { tone: "red", label: "Not Started" },
};

const skillSections = (
  data: NonNullable<Awaited<ReturnType<typeof getCareerAlignment>>>,
) => [
  {
    title: "Strong Match",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    tone: "green" as const,
    skills: data.strongSkills,
    empty: "None matched yet.",
  },
  {
    title: "Developing",
    icon: <CircleDot className="w-5 h-5 text-blue-500" />,
    tone: "blue" as const,
    skills: data.developingSkills,
    empty: "None developing yet.",
  },
  {
    title: "Missing Skills",
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    tone: "orange" as const,
    skills: data.missingSkills,
    empty: "None missing.",
  },
  {
    title: "Critical Gaps",
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    tone: "red" as const,
    skills: data.criticalGaps,
    empty: "No critical gaps.",
  },
];

export default function CareerAlignmentPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["careerAlignment", session?.user?.id],
    queryFn: () => getCareerAlignment(),
    enabled: !!session?.user?.id,
  });

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  if (isLoading) {
    return <GenericPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Error</h3>
        <p className="text-muted-foreground">
          Failed to load career alignment. Please refresh.
        </p>
      </div>
    );
  }

  if (data.targetRole === "NO_TARGET_ROLE") {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
        <PageHeader
          title="Career Alignment"
          description="See how your current skills match up against your target role requirements."
        />
        <DashboardCard className="max-w-xl mx-auto mt-10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No target career set.</h3>
            <p className="text-muted-foreground mb-6">
              Complete your onboarding to set a target career and see your
              alignment.
            </p>
            <DashboardButton href={data.href} text={data.nextAction} size="lg" />
          </CardContent>
        </DashboardCard>
      </div>
    );
  }

  const meta = alignmentMeta(data.matchPercentage);
  const totalRequired = data.requirements.length;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <PageHeader
        title="Career Alignment"
        description="See how your current skills match up against your target role requirements."
      />

      {/* Hero: match ring + target role + next action */}
      <DashboardCard className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Target Role
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                {data.targetRole}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <StatusBadge tone={meta.tone} icon={<Target className="w-3.5 h-3.5" />}>
                {meta.label}
              </StatusBadge>
              <StatusBadge tone="purple">
                {data.strongSkills.length} strong · {data.developingSkills.length}{" "}
                developing
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Baseline computed against {totalRequired} required skill
              {totalRequired === 1 ? "" : "s"} for this role.
            </p>
            <DashboardButton
              href={data.href}
              text={
                <>
                  {data.nextAction} <ArrowRight className="w-4 h-4" />
                </>
              }
              size="lg"
            />
          </div>

          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="alignment-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9F54F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                <path
                  className="text-primary/15"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  stroke="url(#alignment-ring)"
                  strokeDasharray={`${data.matchPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-foreground">
                  {data.matchPercentage}%
                </span>
                <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Match
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </DashboardCard>

      {/* Skill breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillSections(data).map((section) => (
          <DashboardCard key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.icon} {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {section.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-medium border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{section.empty}</p>
              )}
              {section.tone === "red" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Critical gaps block your match score the most — prioritize
                  these skills first.
                </p>
              )}
            </CardContent>
          </DashboardCard>
        ))}
      </div>

      {/* Detailed requirements */}
      <DashboardCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Compass className="w-5 h-5" /> Detailed Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-xl border border-border">
            {data.requirements.map((req, idx) => (
              <div
                key={req.skill + idx}
                className="flex items-center justify-between gap-4 p-4 bg-card-soft first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-semibold text-sm text-foreground">
                  {req.skill}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge tone={importanceTone[req.importance]}>
                    {req.importance} Priority
                  </StatusBadge>
                  <StatusBadge
                    tone={statusBadges[req.status].tone}
                    icon={
                      req.status === "acquired" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : req.status === "learning" ? (
                        <CircleDot className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {statusBadges[req.status].label}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DashboardCard>

      {/* Recommendations */}
      <DashboardCard className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" /> Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </DashboardCard>
    </div>
  );
}