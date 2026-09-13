"use client";

import { useQuery } from "@tanstack/react-query";
import { serverFetch } from "@/src/lib/core/server";
import { authClient } from "@/src/lib/auth-client";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

const services = [
  { key: "database", label: "Database" },
  { key: "backend", label: "Backend API" },
  { key: "auth", label: "Authentication" },
  { key: "ai", label: "AI Providers" },
] as const;

type ServiceRow = { key: string; label: string; status: string };

function statusBadge(status: string) {
  const lower = status.toLowerCase();
  const isOk =
    lower === "ok" ||
    lower === "online" ||
    lower === "healthy" ||
    lower === "connected";
  const isErr =
    lower === "error" ||
    lower === "offline" ||
    lower === "down" ||
    lower === "failed" ||
    lower === "disconnected";

  if (isOk) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
        <CheckCircle className="w-3 h-3" />
        {status}
      </span>
    );
  }
  if (isErr) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
        <XCircle className="w-3 h-3" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/10 text-orange-500">
      <AlertCircle className="w-3 h-3" />
      {status}
    </span>
  );
}

const columns: AdminDataTableColumn<ServiceRow>[] = [
  {
    header: "Service",
    render: (svc) => (
      <span className="font-medium text-foreground">{svc.label}</span>
    ),
  },
  { header: "Status", render: (svc) => statusBadge(svc.status) },
];

export default function AdminSystemHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminSystemHealth", userId],
    queryFn: () => serverFetch(`/api/admin/system-health?userId=${userId}`),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load system health. Please try again.
        </p>
      </div>
    );
  }

  const rows: ServiceRow[] = services.map((svc) => ({
    ...svc,
    status: data[svc.key],
  }));

  return (
    <AdminDataTable
      columns={columns}
      rows={rows}
      rowKey={(svc) => svc.key}
      emptyMessage="No services found."
    />
  );
}
