"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminCareerReadiness } from "@/src/lib/api/admin/career-readiness";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@heroui/react";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface ProfileRow {
  id: string;
  user: { name: string; email: string };
  matchRole: string;
  score: number;
  targetRole: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500/10 text-green-500";
  if (score >= 50) return "bg-orange-500/10 text-orange-500";
  return "bg-red-500/10 text-red-500";
};

const columns: AdminDataTableColumn<ProfileRow>[] = [
  {
    header: "Learner",
    render: (p) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="size-4" />
        </div>
        <div>
          <p className="font-medium text-foreground">{p.user.name}</p>
          <p className="text-xs text-muted-foreground">{p.user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Target Role",
    render: (p) => (
      <span className="font-medium text-foreground">{p.targetRole}</span>
    ),
  },
  {
    header: "Readiness Score",
    render: (p) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScoreColor(p.score)}`}
      >
        {p.score}%
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
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

  const filtered = profiles.filter((p: ProfileRow) => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return true;
    return (
      p.user.name.toLowerCase().includes(q) ||
      p.targetRole.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
