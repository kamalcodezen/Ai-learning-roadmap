"use client";
import { StatusBadge } from "@/src/components/dashboard/shared/patterns";
import { useQuery } from "@tanstack/react-query";
import { getAdminJobReality, AdminJobRealityRoleItem } from "@/src/lib/api/admin/job-reality";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import { Briefcase } from "lucide-react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";
import "../admin.css";

const columns: AdminDataTableColumn<AdminJobRealityRoleItem>[] = [
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

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={true}
        kpiCount={1}
        hasSearch={false}
        hasToolbar={true}
        dropdownCount={0}
      />
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Job <span className="text-brand">Reality</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Explore popular roles and job-market alignment for learners
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
        <GlowCard>
          <p className="text-sm text-muted-foreground">Total Job Checks</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
            <NumberTicker value={data.totalChecks} />
          </p>
        </GlowCard>
      </div>

      <AdminDataTable
        scrollable
        columns={columns}
        rows={data.popularRoles}
        rowKey={(r) => r.role}
        emptyMessage="No job reality data found."
        exportCsv={() => exportAdminData(userId!, "job-reality")}
      />
    </div>
  );
}
