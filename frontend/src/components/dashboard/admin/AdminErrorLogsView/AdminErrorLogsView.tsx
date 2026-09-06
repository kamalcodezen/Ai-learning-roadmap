"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { getAdminErrorLogs } from "@/src/lib/api/admin/error-logs";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

function statusCodeColor(code: number | null) {
  if (!code) return "bg-gray-500/10 text-gray-500";
  if (code >= 200 && code < 300) return "bg-green-500/10 text-green-500";
  if (code >= 400 && code < 500) return "bg-orange-500/10 text-orange-500";
  if (code >= 500) return "bg-red-500/10 text-red-500";
  return "bg-gray-500/10 text-gray-500";
}

interface ErrorLogRow {
  id: string;
  path: string;
  message: string;
  method: string;
  createdAt: string;
  endpoint: string;
  statusCode: number | null;
  errorType: string;
}

const columns: AdminDataTableColumn<ErrorLogRow>[] = [
  {
    header: "Type",
    render: (err) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
          <AlertTriangle className="size-4" />
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
          {err.errorType}
        </span>
      </div>
    ),
  },
  {
    header: "Message",
    render: (err) => (
      <span className="max-w-[300px] truncate text-sm" title={err.message}>
        {err.message}
      </span>
    ),
  },
  {
    header: "Endpoint",
    render: (err) => (
      <span className="font-mono text-xs">
        {err.method} {err.endpoint}
      </span>
    ),
  },
  {
    header: "Status",
    render: (err) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCodeColor(err.statusCode)}`}
      >
        {err.statusCode || "N/A"}
      </span>
    ),
  },
  {
    header: "Time",
    render: (err) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(err.createdAt), { addSuffix: true })}
      </span>
    ),
  },
];

export default function AdminErrorLogsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const take = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminErrorLogs", userId, page],
    queryFn: () => getAdminErrorLogs(userId!, (page - 1) * take, take),
    enabled: !!userId,
  });

  const filteredErrors = useMemo(() => {
    if (!data?.errors) return [];
    if (!debouncedSearch) return data.errors;
    const q = debouncedSearch.toLowerCase();
    return data.errors.filter(
      (err: ErrorLogRow) =>
        err.message.toLowerCase().includes(q) ||
        err.endpoint.toLowerCase().includes(q) ||
        err.errorType.toLowerCase().includes(q),
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
          Unable to load error logs. Please try again.
        </p>
      </div>
    );
  }

  const { total } = data;

  return (
    <AdminDataTable
      columns={columns}
      rows={filteredErrors}
      rowKey={(err) => err.id}
      emptyMessage="No errors found matching your search."
      searchTerm={search}
      onSearchChange={(val) => {
        setSearch(val);
        setPage(1);
      }}
      searchPlaceholder="Search by message, endpoint or type..."
      exportCsv={() => exportAdminData(userId!, "error-logs")}
      page={page}
      take={take}
      total={total}
      onPageChange={setPage}
    />
  );
}
