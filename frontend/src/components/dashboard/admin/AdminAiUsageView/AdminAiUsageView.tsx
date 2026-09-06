"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAiUsage } from "@/src/lib/api/admin/ai-usage";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Skeleton } from "@heroui/react";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import { Cpu } from "lucide-react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface AiUsageRow {
  id: string;
  provider: string;
  model: string;
  feature: string;
  status: string;
  createdAt: string;
}

const columns: AdminDataTableColumn<AiUsageRow>[] = [
  {
    header: "Provider",
    render: (a) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Cpu className="size-4" />
        </div>
        <div className="font-medium text-foreground">
          {a.provider} ({a.model})
        </div>
      </div>
    ),
  },
  { header: "Feature", render: (a) => <span>{a.feature}</span> },
  {
    header: "Status",
    render: (a) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.status === "SUCCESS" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
      >
        {a.status}
      </span>
    ),
  },
  {
    header: "Date",
    render: (a) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(a.createdAt).toLocaleString()}
      </span>
    ),
  },
];

export default function AdminAiUsageView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAiUsage", userId, skip, take],
    queryFn: () => getAdminAiUsage(userId!, skip, take),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2].map((i) => (
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
          Unable to load AI usage data. Please try again.
        </p>
      </div>
    );
  }

  const total = data.total;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <GlowCard>
          <p className="text-sm text-muted-foreground">Total AI Calls</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
            <NumberTicker value={data.total} />
          </p>
        </GlowCard>
        <GlowCard>
          <p className="text-sm text-muted-foreground">Success</p>
          <p className="mt-2 text-3xl font-bold text-green-500">
            <NumberTicker value={data.successCount} />
          </p>
        </GlowCard>
        <GlowCard>
          <p className="text-sm text-muted-foreground">Failures</p>
          <p className="mt-2 text-3xl font-bold text-red-500">
            <NumberTicker value={data.failureCount} />
          </p>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.providerStats.map(
          (p: {
            provider: string;
            total: number;
            success: number;
            failure: number;
          }) => (
            <GlowCard key={p.provider}>
              <p className="text-lg font-bold text-foreground mb-2">
                {p.provider}
              </p>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{p.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success:</span>
                <span className="text-green-500 font-medium">{p.success}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Failure:</span>
                <span className="text-red-500 font-medium">{p.failure}</span>
              </div>
            </GlowCard>
          ),
        )}
      </div>

      <AdminDataTable
        columns={columns}
        rows={data.logs}
        rowKey={(a) => a.id}
        emptyMessage="No AI usage logs found."
        exportCsv={() => exportAdminData(userId!, "ai-usage")}
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
