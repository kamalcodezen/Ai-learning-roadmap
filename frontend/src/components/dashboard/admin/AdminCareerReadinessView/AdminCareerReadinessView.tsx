"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminCareerReadiness, AdminCareerReadinessProfileItem } from "@/src/lib/api/admin/career-readiness";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { User } from "lucide-react";
import { useDebounce } from "use-debounce";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500/10 text-green-500";
  if (score >= 50) return "bg-orange-500/10 text-orange-500";
  return "bg-red-500/10 text-red-500";
};

const columns: AdminDataTableColumn<AdminCareerReadinessProfileItem>[] = [
  {
    header: "Learner",
    render: (p) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{p.user?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{p.user?.email || "No email"}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Target Role",
    render: (p) => (
      <span className="font-medium text-foreground">
        {p.targetRole || "Not specified"}
      </span>
    ),
  },
  {
    header: "Readiness Score",
    render: (p) => {
      const score = Math.round(Number(p.readinessScore ?? p.score ?? 0));
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScoreColor(
            score
          )}`}
        >
          {score}%
        </span>
      );
    },
  },
  {
    header: "Assessments Passed",
    render: (p) => (
      <span className="text-muted-foreground">
        {Number(p.assessmentsPassed ?? 0)}
      </span>
    ),
  },
];

export default function AdminCareerReadinessView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCareerReadiness", userId],
    queryFn: () => getAdminCareerReadiness(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={true}
        kpiCount={4}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={0}
      />
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load career readiness data. Please try again.
        </p>
      </div>
    );
  }

  const { profiles, summary } = data;

  const stats = [
    { label: "Ready", value: summary.ready },
    { label: "Almost Ready", value: summary.almost },
    { label: "Needs Work", value: summary.needsWork },
    { label: "Early Stage", value: summary.early },
  ];

  const filtered = profiles.filter((p) => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return true;
    return (
      (p.user?.name?.toLowerCase().includes(q) ?? false) ||
      (p.targetRole?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Career <span className="text-brand">Readiness</span></h1>
          <p className="section-subtitle mt-1 text-left">Assess learner preparedness for target career roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
        {stats.map((s) => (
          <GlowCard key={s.label}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
              <NumberTicker value={s.value} />
            </p>
          </GlowCard>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        emptyMessage="No data found."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by learner name or target role..."
        exportCsv={() => exportAdminData(userId!, "career-readiness")}
      />
    </div>
  );
}
