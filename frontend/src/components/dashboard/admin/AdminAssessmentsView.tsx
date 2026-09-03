"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAssessments } from "@/src/lib/api/admin/assessments";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { ClipboardCheck, ArrowLeft, ArrowRight, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Key,
  Label,
  ListBox,
  SearchField,
  Select,
  Skeleton,
} from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";
import AdminGlowCard from "./AdminGlowCard";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";

export default function AdminAssessmentsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = page * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAssessments", userId, skip, take, debouncedSearch, statusFilter, daysFilter],
    queryFn: () => getAdminAssessments(userId!, skip, take, debouncedSearch, statusFilter, daysFilter ? Number(daysFilter) : undefined),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load assessments. Please try again.</p>
      </div>
    );
  }

  const { attempts, total, completed, averageScore } = data;
  const totalPages = Math.ceil(total / take);
  const passRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total Attempts", value: total },
    { label: "Completed", value: completed },
    { label: "Average Score", value: Math.round(averageScore), suffix: "%" },
    { label: "Completion Rate", value: passRate, suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <AdminGlowCard key={s.label}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
              <NumberTicker value={s.value} />
              {s.suffix ?? ""}
            </p>
          </AdminGlowCard>
        ))}
      </div>

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
              className="w-full sm:w-40"
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
                  <ListBox.Item key="IN_PROGRESS" id="IN_PROGRESS" textValue="In Progress">
                    In Progress
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="COMPLETED" id="COMPLETED" textValue="Completed">
                    Completed
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <Select
              className="w-full sm:w-40"
              placeholder="Any Time"
              value={daysFilter}
              onChange={(val) => { setDaysFilter(val); setPage(0); }}
            >
              <Label>Time Range</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item key="7" id="7" textValue="Last 7 Days">Last 7 Days<ListBox.ItemIndicator /></ListBox.Item>
                  <ListBox.Item key="30" id="30" textValue="Last 30 Days">Last 30 Days<ListBox.ItemIndicator /></ListBox.Item>
                  <ListBox.Item key="90" id="90" textValue="Last 90 Days">Last 90 Days<ListBox.ItemIndicator /></ListBox.Item>
                  <ListBox.Item key="365" id="365" textValue="Last Year">Last Year<ListBox.ItemIndicator /></ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <button
              onClick={() => exportAdminData(userId!, 'assessments')}
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
                  <th className="p-4 text-right font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Score</th>
                  <th className="p-4 text-right font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Started At</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4">
                      <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <ClipboardCheck className="h-8 w-8 opacity-50" />
                        No assessments found matching your search.
                      </div>
                    </td>
                  </tr>
                ) : attempts.map((a: { id: string; targetRole: string; user: { name: string; email: string }; status: string; score: number; startedAt: string }) => (
                  <tr key={a.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ClipboardCheck className="size-4" />
                        </div>
                        <div className="font-medium text-foreground">{a.targetRole || "Unknown Role"}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{a.user.name}</p>
                          <p className="text-xs text-muted-foreground">{a.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        a.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        {a.score !== null ? `${a.score}%` : "-"}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap text-muted-foreground">
                      {new Date(a.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * take + 1} to {Math.min((page + 1) * take, total)} of {total} assessments
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
    </div>
  );
}
