"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, GraduationCap } from "lucide-react";
import { getDashboardOverview } from "@/src/lib/api/learner/dashboard";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";
import DashboardProfile from "@/src/components/dashboard/shared/profile/DashboardProfile";
import type { ProfileChart } from "@/src/components/dashboard/shared/profile/DashboardProfile";

const COVER_IMAGE = "/images/dashboardBanner.png";
const COVER_IMAGE_DARK = "/images/dashboardBannerDark.png";

export default function LearnerProfilePage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isPending: isDashboardPending } = useQuery({
    queryKey: ["dashboardData", session?.user?.id],
    queryFn: () => getDashboardOverview(),
    enabled: !!session?.user?.id,
  });

  const quickMetrics = useMemo(() => {
    if (!data) return [];
    const r = data.readiness;
    return [
      { label: "Knowledge", value: String(r?.knowledge ?? 0) },
      { label: "Practical", value: String(r?.practical ?? 0) },
      { label: "Projects", value: String(r?.projects ?? 0) },
      { label: "Problem Solve", value: String(r?.problemSolving ?? 0) },
    ];
  }, [data]);

  const chart: ProfileChart | undefined = useMemo(() => {
    if (!data) return undefined;
    const r = data.readiness;
    const grouped = [
      { name: "Knowledge", value: r?.knowledge ?? 0 },
      { name: "Practical", value: r?.practical ?? 0 },
      { name: "Projects", value: r?.projects ?? 0 },
      { name: "Problem", value: r?.problemSolving ?? 0 },
      { name: "Comm", value: r?.communication ?? 0 },
      { name: "Interview", value: r?.interview ?? 0 },
    ];
    return {
      title: "Readiness Profile",
      subtitle: "Your learning progress and readiness across skill areas",
      data: grouped,
      xKey: "name",
      yKey: "value",
    };
  }, [data]);

  if (isSessionLoading || isDashboardPending) {
    return <GenericPageSkeleton />;
  }

  const targetRole =
    data?.career?.targetRole || "Learner";

  return (
    <DashboardProfile
      coverImage={COVER_IMAGE}
      coverImageDark={COVER_IMAGE_DARK}
      roleLabel="Learner"
      bio={`Focused on becoming a ${targetRole}.`}
      metaItems={[
        { icon: GraduationCap, label: targetRole },
        { icon: MapPin, label: "AI Pather" },
        { icon: Calendar, label: "Joined 2026" },
      ]}
      introItems={[
        {
          icon: "📧",
          label: "Email",
          value: session?.user?.email || "learner@aipather.com",
        },
        {
          icon: "📈",
          label: "Active Status",
          value: <span className="text-green-500 font-bold">Verified</span>,
        },
        {
          icon: "🎯",
          label: "Target Role",
          value: targetRole,
        },
      ]}
      quickMetrics={quickMetrics}
      chart={chart}
    />
  );
}