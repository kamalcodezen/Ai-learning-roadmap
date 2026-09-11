"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getJobReality,
  JobRealityData,
  JobRealitySkill,
  JobRealityRecommendation,
} from "@/src/lib/api/learner/job-reality";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import Button from "@/src/components/ui/button";
import {
  Briefcase,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Database,
  MapPin,
  Sparkles,
  RefreshCw,
  Info,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function JobRealityContent() {
  const { data: session, isPending: sessionLoading } = useDashboardSession();
  const userId = session?.user?.id;
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["jobReality", userId, selectedLocation],
    queryFn: () => getJobReality(selectedLocation === "all" ? undefined : selectedLocation),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 mins
    refetchOnWindowFocus: false,
  });

  if (sessionLoading || (isLoading && !data)) {
    return <GenericPageSkeleton />;
  }

  if (isError) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to load market data.";

    if (errorMsg.includes("No target role")) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Target Role Required</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            We need to know your target career before we can analyze real job market demand.
          </p>
          <Link href="/dashboard/learner/profile">
            <Button text="Complete Profile" />
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Market Data Unavailable</h3>
        <p className="text-muted-foreground mb-6">
          Could not connect to the live job-market provider at this moment.
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            text={isRefetching ? "Retrying..." : "Retry Connection"}
            onClick={() => refetch()}
            variant="soft"
          />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Handle potential nested data structure
  const rawObj = data as { success?: boolean; data?: JobRealityData };
  const jobData: JobRealityData =
    rawObj.success && rawObj.data ? rawObj.data : (data as JobRealityData);

  const market = jobData.market || {};
  const skills: JobRealitySkill[] = jobData.skills || [];
  const insights: string[] = jobData.insights || [];
  const recommendations: JobRealityRecommendation[] = jobData.recommendations || [];
  const aiAnalysis = jobData.aiAnalysis || { available: false };
  const source = jobData.source || { provider: "Arbeitnow API", fetchedAt: new Date().toISOString() };

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Real Market Intelligence
            </span>
            {isRefetching && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">Job Reality</h1>
          <p className="text-muted-foreground mt-1">
            Live market expectations and verified skill alignment for{" "}
            <span className="font-semibold text-foreground">
              {jobData.targetRole}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
              aria-label="Filter job market location"
            >
              <option value="all" className="bg-popover text-popover-foreground">All Locations</option>
              <option value="remote" className="bg-popover text-popover-foreground">Remote Only</option>
              <option value="europe" className="bg-popover text-popover-foreground">Europe / UK</option>
              <option value="us" className="bg-popover text-popover-foreground">United States</option>
              <option value="apac" className="bg-popover text-popover-foreground">Asia-Pacific</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <Database className="w-3.5 h-3.5 text-primary" />
            Data via {source.provider} • Updated{" "}
            {formatDistanceToNow(new Date(source.fetchedAt))} ago
            {source.cached && (
              <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
                cached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Low Sample Warning Banner */}
      {market.lowSampleSize && market.jobCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Limited Market Sample:</span> Analyzed {market.jobCount} relevant listing(s) for the selected location filter. Metrics represent available data.
          </div>
        </div>
      )}

      {/* Market Snapshot Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 dashboard-card-gap">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                Market Demand
              </p>
              <BarChart3
                className={`w-5 h-5 ${
                  market.demandLevel === "High"
                    ? "text-emerald-500"
                    : market.demandLevel === "Medium"
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <h3 className="text-3xl font-bold">{market.demandLevel}</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Based on active relevant listing density
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                Listings Analysed
              </p>
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold">
              {market.jobCount !== undefined && market.jobCount !== null
                ? market.jobCount
                : "Unavailable"}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              {market.rawFetchedCount && market.rawFetchedCount > market.jobCount
                ? `${market.jobCount} relevant out of ${market.rawFetchedCount} fetched`
                : "Relevant verified market job posts"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">Market Trend</p>
              <TrendingUp
                className={`w-5 h-5 ${
                  market.trend === "Growing"
                    ? "text-emerald-500"
                    : market.trend === "Declining"
                    ? "text-rose-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <h3 className="text-3xl font-bold">
              {market.trend || "Insufficient Data"}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Derived from relevant listing velocity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Skills Table & AI Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 dashboard-card-gap">
        {/* Left Col (2 cols wide): Dynamic Skills Table */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">What Employers Are Asking For</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comparing verified learner scores with real employer skill frequencies across relevant listings.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {skills.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  No active skill metrics calculated for the current role & location filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">
                          Skill
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Jobs Mentioning
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Market Demand
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Your Score
                        </th>
                        <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">
                          Gap / Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {skills.map((skill) => (
                        <tr
                          key={skill.name}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-4 font-medium flex items-center gap-2">
                            {skill.importance === "high" ? (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"
                                title="Core Requirement"
                              ></span>
                            ) : (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"
                                title="Preferred Requirement"
                              ></span>
                            )}
                            <span className="text-foreground">{skill.name}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-medium text-muted-foreground">
                              {skill.jobsMentioning} / {skill.totalJobs || market.jobCount || 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex items-center justify-center">
                              <span className="font-semibold text-foreground">
                                {skill.demandScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex items-center justify-center">
                              <span className="font-semibold text-foreground">
                                {skill.learnerScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {skill.status === "Ready" || skill.gap === 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{" "}
                                Ready
                              </span>
                            ) : skill.status === "Critical Gap" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                Critical ({skill.gap})
                              </span>
                            ) : skill.status === "High Gap" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                High ({skill.gap})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                Moderate ({skill.gap})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </DashboardCard>
        </div>

        {/* Right Col: AI Market Insights & Personalized Recommendations */}
        <div className="space-y-6">
          {/* Role Summary Callout */}
          {aiAnalysis.roleSummary && (
            <DashboardCard className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" /> AI Market Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                  {aiAnalysis.roleSummary}
                </p>

                {aiAnalysis.commonTools && aiAnalysis.commonTools.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Commonly Mentioned Tools
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis.commonTools.map((tool, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-background border border-border text-foreground font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </DashboardCard>
          )}

          {/* AI Grounded Insights */}
          <DashboardCard>
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {!aiAnalysis.available && (
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Showing calculated listing statistics. AI interpretation offline.
                </p>
              )}
              <ul className="space-y-3.5">
                {insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="p-1 rounded-full bg-primary/10 text-primary mt-0.5 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </DashboardCard>

          {/* Recommended Next Best Actions */}
          <DashboardCard className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Recommended Next Best Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-muted/40 border border-border hover:border-primary/30 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-foreground leading-normal">
                        {rec.text}
                      </p>
                    </div>

                    {rec.href && (
                      <Link href={rec.href} className="self-end mt-1">
                        <Button
                          text={
                            rec.actionType === "GENERATE_PROJECT"
                              ? "Generate Project"
                              : "Go to Learning Path"
                          }
                          variant="soft"
                          className="text-xs py-1 px-2.5 flex items-center gap-1"
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/dashboard/learner/learning-path"
                  className="w-full"
                >
                  <Button
                    text="Continue Learning Path"
                    className="w-full flex items-center justify-center gap-1.5"
                  />
                </Link>

                <Link
                  href="/dashboard/learner/portfolio"
                  className="w-full"
                >
                  <Button
                    text="Generate Project for Gap Skill"
                    variant="soft"
                    className="w-full flex items-center justify-center gap-1.5"
                  />
                </Link>
              </div>
            </CardContent>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
