"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminRoadmaps } from "@/src/lib/api/admin/roadmaps";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Route, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Label, ListBox, Select, Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface RoadmapRow {
  id: string;
  targetRole: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  milestones?: Array<{ status: string }>;
}

const columns: AdminDataTableColumn<RoadmapRow>[] = [
  {
    header: "Target Role",
    render: (rm) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Route className="size-4" />
        </div>
        <div className="font-medium text-foreground">{rm.targetRole}</div>
      </div>
    ),
  },
  {
    header: "Learner",
    render: (rm) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{rm.user.name}</p>
          <p className="text-xs text-muted-foreground">{rm.user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Status",
    render: (rm) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          rm.status === "ACTIVE"
            ? "bg-green-500/10 text-green-500"
            : rm.status === "COMPLETED"
              ? "bg-blue-500/10 text-blue-500"
              : "bg-[var(--color-muted)] text-[var(--color-text-primary)]"
        }`}
      >
        {rm.status}
      </span>
    ),
  },
  {
    header: "Progress",
    render: (rm) => {
      const totalMilestones = rm.milestones?.length || 0;
      const completedMilestones =
        rm.milestones?.filter((m) => m.status === "COMPLETED").length || 0;
      const progress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-[var(--color-muted)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      );
    },
  },
  {
    header: "Created Date",
    render: (rm) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(rm.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default function AdminRoadmapsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminRoadmaps",
      userId,
      skip,
      take,
      debouncedSearch,
      statusFilter,
    ],
    queryFn: () =>
      getAdminRoadmaps(userId!, skip, take, debouncedSearch, statusFilter),
    enabled: !!userId,
  });

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
          Unable to load roadmaps. Please try again.
        </p>
      </div>
    );
  }

  const { roadmaps, total } = data;

  return (
    <AdminDataTable
      columns={columns}
      rows={roadmaps}
      rowKey={(rm) => rm.id}
      emptyMessage="No roadmaps found matching your search."
      searchTerm={searchTerm}
      onSearchChange={(val) => {
        setSearchTerm(val);
        setPage(1);
      }}
      searchPlaceholder="Search by learner name or email..."
      toolbar={
        <Select
          className="w-full sm:w-48"
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
              <ListBox.Item key="ACTIVE" id="ACTIVE" textValue="Active">
                Active
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
      }
      exportCsv={() => exportAdminData(userId!, "roadmaps")}
      page={page}
      take={take}
      total={total}
      onPageChange={setPage}
    />
  );
}
