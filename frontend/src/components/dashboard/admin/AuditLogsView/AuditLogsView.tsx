"use client";
import { StatusBadge } from "@/src/components/dashboard/shared/patterns";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "@/src/lib/api/admin/audit-logs";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface AuditLogRow {
  id: string;
  action: string;
  admin: { name: string; email: string };
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

const columns: AdminDataTableColumn<AuditLogRow>[] = [
  {
    header: "Action",
    render: (log) => <StatusBadge tone="primary">{log.action}</StatusBadge>,
  },
  {
    header: "Admin",
    render: (log) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="size-4" />
        </div>
        <div>
          <div className="font-medium text-foreground">{log.admin.name}</div>
          <div className="text-xs text-muted-foreground">{log.admin.email}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Target ID",
    render: (log) =>
      log.targetId ? (
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {log.targetId}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    header: "Details",
    render: (log) => (
      <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
        {log.details ? JSON.stringify(log.details) : "-"}
      </span>
    ),
  },
  {
    header: "Date",
    render: (log) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(log.createdAt).toLocaleString()}
      </span>
    ),
  },
];

export default function AuditLogsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAuditLogs", userId, skip, take],
    queryFn: () => getAdminAuditLogs(userId!, skip, take),
    enabled: !!userId,
  });

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    if (!debouncedSearch) return data.logs;
    const q = debouncedSearch.toLowerCase();
    return data.logs.filter(
      (log: AuditLogRow) =>
        log.action.toLowerCase().includes(q) ||
        log.admin.name.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q)),
    );
  }, [data, debouncedSearch]);

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load audit logs. Please try again.
        </p>
      </div>
    );
  }

  const { total } = data;

  return (
    <AdminDataTable
      columns={columns}
      rows={filteredLogs}
      rowKey={(log) => log.id}
      emptyMessage="No audit logs found matching your search."
      searchTerm={search}
      onSearchChange={(val) => {
        setSearch(val);
        setPage(1);
      }}
      searchPlaceholder="Search by action, admin name or target..."
      exportCsv={() => exportAdminData(userId!, "audit-logs")}
      page={page}
      take={take}
      total={total}
      onPageChange={setPage}
    />
  );
}
