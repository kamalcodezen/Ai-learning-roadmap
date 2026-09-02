"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { getAdminErrorLogs } from "@/src/lib/api/admin/error-logs";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Label, SearchField, Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

function statusCodeColor(code: number | null) {
  if (!code) return "bg-gray-500/10 text-gray-500";
  if (code >= 200 && code < 300) return "bg-green-500/10 text-green-500";
  if (code >= 400 && code < 500) return "bg-orange-500/10 text-orange-500";
  if (code >= 500) return "bg-red-500/10 text-red-500";
  return "bg-gray-500/10 text-gray-500";
}

export default function AdminErrorLogsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const take = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminErrorLogs", userId, page],
    queryFn: () => getAdminErrorLogs(userId!, page * take, take),
    enabled: !!userId,
  });

  const filteredErrors = useMemo(() => {
    if (!data?.errors) return [];
    if (!debouncedSearch) return data.errors;
    const q = debouncedSearch.toLowerCase();
    return data.errors.filter(
      (err: { message: string; endpoint: string; errorType: string }) =>
        err.message.toLowerCase().includes(q) ||
        err.endpoint.toLowerCase().includes(q) ||
        err.errorType.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
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
        <p className="text-red-500 font-medium">Unable to load error logs. Please try again.</p>
      </div>
    );
  }

  const { total } = data;
  const totalPages = Math.ceil(total / take);

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchField
            className="flex-1 w-full max-w-md"
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
          >
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input className="w-full" placeholder="Search by message, endpoint or type..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <button
            onClick={() => exportAdminData(userId!, "error-logs")}
            className="w-full sm:w-auto bg-[var(--color-brand)] text-white h-10 px-4 rounded-md text-sm font-medium hover:brightness-110 transition"
          >
            Export CSV
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Type</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Message</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Endpoint</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-50" />
                      No errors found matching your search.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredErrors.map((err: { id: string; path: string; message: string; method: string; createdAt: string; endpoint: string; statusCode: number; errorType: string }) => (
                  <tr key={err.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                          <AlertTriangle className="size-4" />
                        </div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
                          {err.errorType}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-[300px] truncate text-sm" title={err.message}>
                      {err.message}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {err.method} {err.endpoint}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCodeColor(err.statusCode)}`}>
                        {err.statusCode || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(err.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {page * take + 1} to {Math.min((page + 1) * take, total)} of {total} errors
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-primary)] text-white font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
