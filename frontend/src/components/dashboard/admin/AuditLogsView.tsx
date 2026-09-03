"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "@/src/lib/api/admin/audit-logs";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { FileText, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Label, SearchField, Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

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
      (log: { action: string; admin: { name: string }; targetId: string | null }) =>
        log.action.toLowerCase().includes(q) ||
        log.admin.name.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
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
        <p className="text-red-500 font-medium">Unable to load audit logs. Please try again.</p>
      </div>
    );
  }

  const { total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchField
            className="flex-1 w-full max-w-md"
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
          >
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input className="w-full" placeholder="Search by action, admin name or target..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <button
            onClick={() => exportAdminData(userId!, "audit-logs")}
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
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Action</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Admin</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Target ID</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Details</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 opacity-50" />
                      No audit logs found matching your search.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: { id: string; action: string; admin: { name: string; email: string }; targetId: string | null; details: Record<string, unknown>; createdAt: string }) => (
                  <tr key={log.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <User className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{log.admin.name}</div>
                          <div className="text-xs text-muted-foreground">{log.admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.targetId ? (
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {log.targetId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
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
              Showing {skip + 1} to {Math.min(skip + take, total)} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
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
