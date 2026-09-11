"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAssessments } from "@/src/lib/api/admin/assessments";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { ClipboardCheck, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Key, Label, ListBox, Select, Skeleton } from "@heroui/react";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface AssessmentRow {
  id: string;
  targetRole: string;
  user: { name: string; email: string };
  status: string;
  score: number | null;
  startedAt: string;
}

const columns: AdminDataTableColumn<AssessmentRow>[] = [
  {
    header: "Target Role",
    render: (a) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardCheck className="size-4" />
        </div>
        <div className="font-medium text-foreground">
          {a.targetRole || "Unknown Role"}
        </div>
      </div>
    ),
  },
  {
    header: "Learner",
    render: (a) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{a.user.name}</p>
          <p className="text-xs text-muted-foreground">{a.user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Status",
    render: (a) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          a.status === "COMPLETED"
            ? "bg-green-500/10 text-green-500"
            : "bg-orange-500/10 text-orange-500"
        }`}
      >
        {a.status}
      </span>
    ),
  },
  {
    header: "Score",
    render: (a) => (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
        {a.score !== null ? `${a.score}%` : "-"}
      </span>
    ),
  },
  {
    header: "Started At",
    render: (a) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(a.startedAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default function AdminAssessmentsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminAssessments",
      userId,
      skip,
      take,
      debouncedSearch,
      statusFilter,
      daysFilter,
    ],
    queryFn: () =>
      getAdminAssessments(
        userId!,
        skip,
        take,
        debouncedSearch,
        statusFilter,
        daysFilter ? Number(daysFilter) : undefined,
      ),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
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
          Unable to load assessments. Please try again.
        </p>
      </div>
    );
  }

  const { attempts, total, completed, averageScore } = data;
  const passRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total Attempts", value: total },
    { label: "Completed", value: completed },
    { label: "Average Score", value: Math.round(averageScore), suffix: "%" },
    { label: "Completion Rate", value: passRate, suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
        {stats.map((s) => (
          <GlowCard key={s.label}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
              <NumberTicker value={s.value} />
              {s.suffix ?? ""}
            </p>
          </GlowCard>
        ))}
      </div>

      <AdminDataTable
        columns={columns}
        rows={attempts}
        rowKey={(a) => a.id}
        emptyMessage="No assessments found matching your search."
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search by learner name or email..."
        toolbar={
          <>
            <Select
              className="w-full sm:w-40"
              placeholder="All Statuses"
              value={statusFilter || null}
              onChange={(val) => {
                setStatusFilter(val ? String(val) : "");
                setPage(1);
              }}
            >
              <Label>Status</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item
                    key="IN_PROGRESS"
                    id="IN_PROGRESS"
                    textValue="In Progress"
                  >
                    In Progress
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item
                    key="COMPLETED"
                    id="COMPLETED"
                    textValue="Completed"
                  >
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
              onChange={(val) => {
                setDaysFilter(val);
                setPage(1);
              }}
            >
              <Label>Time Range</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item key="7" id="7" textValue="Last 7 Days">
                    Last 7 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="30" id="30" textValue="Last 30 Days">
                    Last 30 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="90" id="90" textValue="Last 90 Days">
                    Last 90 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="365" id="365" textValue="Last Year">
                    Last Year
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </>
        }
        exportCsv={() => exportAdminData(userId!, "assessments")}
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
