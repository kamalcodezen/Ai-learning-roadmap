"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getProgress } from "@/src/lib/api/learner/progress";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Clock, Calendar, Flame, TrendingUp, BookOpen, FileCode, CheckSquare } from "lucide-react";

export default function ProgressPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["progress", session?.user?.id],
    queryFn: () => getProgress(),
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
        <p className="text-muted-foreground">Failed to load. Please refresh.</p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'learning': return <BookOpen className="w-5 h-5 text-primary" />;
      case 'project': return <FileCode className="w-5 h-5 text-purple-500" />;
      case 'assessment': return <CheckSquare className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
        <p className="text-muted-foreground">Monitor your learning hours, streaks, and recent activities.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">{data.weeklyHours}h</span>
            <span className="text-sm text-muted-foreground">This Week</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">{data.monthlyHours}h</span>
            <span className="text-sm text-muted-foreground">This Month</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold">{data.currentStreak} Days</span>
            <span className="text-sm text-muted-foreground">Current Streak</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-500">+{data.readinessTrend}%</span>
            <span className="text-sm text-muted-foreground">Readiness Trend</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card-soft shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground">{activity.title}</h3>
                    <time className="text-xs font-medium text-muted-foreground">{activity.date}</time>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
