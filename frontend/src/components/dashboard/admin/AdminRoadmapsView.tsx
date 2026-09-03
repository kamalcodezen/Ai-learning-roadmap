"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminRoadmaps } from "@/src/lib/api/admin/roadmaps";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { ArrowLeft, ArrowRight, Route, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Label,
  ListBox,
  SearchField,
  Select,
  Skeleton,
} from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function AdminRoadmapsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = page * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminRoadmaps", userId, skip, take, debouncedSearch, statusFilter],
    queryFn: () => getAdminRoadmaps(userId!, skip, take, debouncedSearch, statusFilter),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
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
        <p className="text-red-500 font-medium">Unable to load roadmaps. Please try again.</p>
      </div>
    );
  }

  const { roadmaps, total } = data;
  const totalPages = Math.ceil(total / take);

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchField
            className="flex-1 w-full max-w-md"
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setPage(0); }}
          >
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input className="w-full" placeholder="Search by learner name or email..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <Select
            className="w-full sm:w-48"
            placeholder="All Statuses"
            value={statusFilter || null}
            onChange={(val) => { setStatusFilter(val ? String(val) : ""); setPage(0); }}
          >
            <Label>Status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item key="ACTIVE" id="ACTIVE" textValue="Active">
                  Active
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item key="COMPLETED" id="COMPLETED" textValue="Completed">
                  Completed
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <button
            onClick={() => exportAdminData(userId!, 'roadmaps')}
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
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Target Role</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Learner</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Progress</th>
                <th className="p-4 text-right font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {roadmaps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <Route className="h-8 w-8 opacity-50" />
                      No roadmaps found matching your search.
                    </div>
                  </td>
                </tr>
              ) : (
                roadmaps.map((rm: { id: string; targetRole: string; status: string; createdAt: string; user: { name: string; email: string }; milestones?: Array<{ status: string }> }) => {
                  const totalMilestones = rm.milestones?.length || 0;
                  const completedMilestones = rm.milestones?.filter((m: { status: string }) => m.status === "COMPLETED").length || 0;
                  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <tr key={rm.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Route className="size-4" />
                          </div>
                          <div className="font-medium text-foreground">{rm.targetRole}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{rm.user.name}</p>
                            <p className="text-xs text-muted-foreground">{rm.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          rm.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                          rm.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--color-muted)] text-[var(--color-text-primary)]'
                        }`}>
                          {rm.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-[var(--color-muted)] overflow-hidden">
                            <div className="h-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap text-muted-foreground">
                        {new Date(rm.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {page * take + 1} to {Math.min((page + 1) * take, total)} of {total} roadmaps
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                <ArrowLeft className="h-4 w-4 mr-1 inline" /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-primary)] text-white font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                Next <ArrowRight className="h-4 w-4 ml-1 inline" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
