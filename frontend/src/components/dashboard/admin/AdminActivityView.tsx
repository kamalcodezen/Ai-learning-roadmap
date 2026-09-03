'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminActivity } from "@/src/lib/api/admin/activity";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Activity, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Label,
  SearchField,
  Skeleton,
} from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function AdminActivityView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminActivity", userId],
    queryFn: () => getAdminActivity(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load activity logs. Please try again.</p>
      </div>
    );
  }

  if ((data as { success?: boolean }).success === false) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">{(data as { message?: string }).message || "API Error"}</p>
      </div>
    );
  }

  const activities = data.activities || [];

  const filtered = activities.filter((a: { user?: { name?: string }; type: string; description: string }) => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return true;
    return (
      (a.user?.name || "").toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchField
              className="flex-1 w-full max-w-md"
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
            >
              <Label>Search</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input className="w-full" placeholder="Search by user, type, or description..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <button
              onClick={() => exportAdminData(userId!, "activity")}
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
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">User</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Activity Type</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Description</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <Activity className="h-8 w-8 opacity-50" />
                        No activity logs found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((a: { id: string; user?: { name?: string }; type: string; description: string; createdAt: string }) => (
                    <tr key={a.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="size-4" />
                          </div>
                          <div className="font-medium text-foreground">{a.user?.name || "Unknown"}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                          {a.type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{a.description || "-"}</td>
                      <td className="p-4 whitespace-nowrap text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
