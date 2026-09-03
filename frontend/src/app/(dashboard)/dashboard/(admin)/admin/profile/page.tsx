"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { getAdminDashboardStats } from "@/src/lib/api/admin/dashboard";
import { authClient } from "@/src/lib/auth-client";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";
import DashboardProfile from "@/src/components/dashboard/shared/profile/DashboardProfile";
import type { ProfileChart } from "@/src/components/dashboard/shared/profile/DashboardProfile";

const COVER_IMAGE = "/images/Company_welcome.jpeg";

export default function AdminProfilePage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard", userId],
    queryFn: () => getAdminDashboardStats(userId!),
    enabled: !!userId,
  });

  const quickMetrics = useMemo(() => {
    if (!data) return [];
    const o = data.overview;
    return [
      { label: "Learners", value: String(o.activeLearners ?? 0) },
      { label: "Projects", value: String(o.totalProjects ?? 0) },
      { label: "AI Reqs", value: String(o.aiRequests ?? 0) },
    ];
  }, [data]);

  const chart: ProfileChart | undefined = useMemo(() => {
    if (!data) return undefined;
    const ua = data.userAnalytics;
    const grouped = [
      { name: "Learners", value: ua?.learners ?? 0 },
      { name: "Admins", value: ua?.admins ?? 0 },
      { name: "New", value: ua?.newUsers ?? 0 },
    ];
    return {
      title: "Platform Insights",
      subtitle: "Account distribution and platform analytics feed",
      data: grouped,
      xKey: "name",
      yKey: "value",
    };
  }, [data]);

  if (isSessionLoading || isLoading) {
    return <GenericPageSkeleton />;
  }

  return (
    <DashboardProfile
      coverImage={COVER_IMAGE}
      roleLabel="Admin"
      bio="Managing the platform, one milestone at a time."
      metaItems={[
        { icon: Briefcase, label: "Platform Admin" },
        { icon: MapPin, label: "AI Pather" },
        { icon: Calendar, label: "Joined 2026" },
      ]}
      introItems={[
        { icon: "📧", label: "Email", value: session?.user?.email || "admin@aipather.com" },
        { icon: "📈", label: "Active Status", value: <span className="text-green-500 font-bold">Verified</span> },
        { icon: "🛡️", label: "Access", value: "Admin Console" },
      ]}
      quickMetrics={quickMetrics}
      chart={chart}
    />
  );
}
