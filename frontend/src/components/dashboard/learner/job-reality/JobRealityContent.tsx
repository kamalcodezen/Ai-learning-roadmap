"use client";

import { useQuery } from "@tanstack/react-query";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getJobReality } from "@/src/lib/api/learner/job-reality";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/button";
import { Briefcase, AlertCircle, CheckCircle2, TrendingUp, BarChart3, Database } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function JobRealityContent() {
  const { data: session, isPending: sessionLoading } = useDashboardSession();
  const userId = session?.user?.id;

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["jobReality", userId],
    queryFn: () => getJobReality(),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 mins
    refetchOnWindowFocus: false,
  });

  if (sessionLoading || (isLoading && !data)) {
    return <GenericPageSkeleton />;
  }

  if (isError) {
    const errorMsg = error instanceof Error ? error.message : "Failed to load market data.";
    
    // Empty target role state
    if (errorMsg.includes("No target role")) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Target Role Required</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            We need to know your target career before we can fetch the job market reality.
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
          We could not fetch real-time market data from the external provider at this moment.
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

  interface JobRealityData {
    targetRole: string;
    source: { provider: string; fetchedAt: string };
    market: { demandLevel: string; jobCount: number | null; trend: string };
    skills: { name: string; importance: string; demandScore: number; learnerScore: number; gap: number }[];
    insights: string[];
    recommendations: string[];
  }

  // Handle stale cache from before the API fix where data might still be wrapped in { success, data }
  const dataObj = data as { success?: boolean; data?: JobRealityData };
  const jobData = (dataObj.success && dataObj.data ? dataObj.data : data) as JobRealityData;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Reality</h1>
          <p className="text-muted-foreground mt-2">
            Real-time market demand and expectations for <span className="font-semibold text-foreground">{jobData.targetRole}</span>.
          </p>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
          <Database className="w-3.5 h-3.5" />
          Data via {jobData.source.provider} • Updated {formatDistanceToNow(new Date(jobData.source.fetchedAt))} ago
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">Market Demand</p>
              <BarChart3 className={`w-5 h-5 ${jobData.market.demandLevel === 'High' ? 'text-green-500' : jobData.market.demandLevel === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
            <h3 className="text-3xl font-bold">{jobData.market.demandLevel}</h3>
            <p className="text-xs text-muted-foreground mt-2">Current provider estimation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">Open Roles (Sample)</p>
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold">{jobData.market.jobCount !== null ? jobData.market.jobCount : "Unavailable"}</h3>
            <p className="text-xs text-muted-foreground mt-2">Recent listings analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-muted-foreground">Trend</p>
              <TrendingUp className={`w-5 h-5 ${jobData.market.trend === 'Growing' ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
            <h3 className="text-3xl font-bold">{jobData.market.trend || "Unavailable"}</h3>
            <p className="text-xs text-muted-foreground mt-2">Based on listing frequency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>In-Demand Skills</CardTitle>
              <p className="text-sm text-muted-foreground">
                How your current abilities map to what employers are asking for today.
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">Skill</th>
                      <th className="px-4 py-3 font-semibold text-center">Market Need</th>
                      <th className="px-4 py-3 font-semibold text-center">Your Score</th>
                      <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(jobData.skills as { name: string; importance: string; demandScore: number; learnerScore: number; gap: number }[]).map((skill) => (
                      <tr key={skill.name} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4 font-medium flex items-center gap-2">
                          {skill.importance === 'high' ? (
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Critical Requirement"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500" title="Preferred Requirement"></span>
                          )}
                          {skill.name}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-full">
                            <span className="font-semibold text-foreground">{skill.demandScore}</span>
                            <span className="text-muted-foreground text-xs ml-1">/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-full">
                            <span className="font-semibold text-foreground">{skill.learnerScore}</span>
                            <span className="text-muted-foreground text-xs ml-1">/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {skill.gap === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
                            </span>
                          ) : skill.gap < 20 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                              Moderate ({skill.gap})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              High ({skill.gap})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market-Based Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {jobData.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/10 text-primary mt-0.5 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {jobData.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-background border border-primary/20 text-primary mt-0.5 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {rec}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/dashboard/learner/learning-path" className="w-full inline-block">
                  <Button text="Continue Learning Path" className="w-full" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
