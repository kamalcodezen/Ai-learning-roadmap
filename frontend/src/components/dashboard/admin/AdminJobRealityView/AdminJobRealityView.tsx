"use client";
import { StatusBadge } from "@/src/components/dashboard/shared/patterns";
import { useQuery } from "@tanstack/react-query";
import { getAdminJobReality } from "@/src/lib/api/admin/job-reality";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Skeleton } from "@heroui/react";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import { Briefcase } from "lucide-react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface PopularRoleRow {
  id: string;
  role: string;
  mismatchScore: number;
  activeUsers: number;
  count: number;
}

const columns: AdminDataTableColumn<PopularRoleRow>[] = [
  {
    header: "Target Role",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="size-4" />
        </div>
        <div className="font-medium text-foreground">{r.role}</div>
      </div>
    ),
  },
  {
    header: "Number of Learners",
    render: (r) => (
      <StatusBadge tone="primary">
        <NumberTicker value={r.count} />
      </StatusBadge>
    ),
  },
];

export default function AdminJobRealityView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminJobReality", userId],
    queryFn: () => getAdminJobReality(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-64 rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load job reality data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlowCard>
          <p className="text-sm text-muted-foreground">Total Job Checks</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
            <NumberTicker value={data.totalChecks} />
          </p>
        </GlowCard>
      </div>

      <AdminDataTable
        columns={columns}
        rows={data.popularRoles}
        rowKey={(r) => r.role}
        emptyMessage="No job reality data found."
        exportCsv={() => exportAdminData(userId!, "job-reality")}
      />
    </div>
  );
}
