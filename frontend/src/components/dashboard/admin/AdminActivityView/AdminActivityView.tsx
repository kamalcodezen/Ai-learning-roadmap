"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminActivity } from "@/src/lib/api/admin/activity";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { User } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface ActivityRow {
  id: string;
  user?: { name?: string };
  type: string;
  description: string;
  createdAt: string;
}

const columns: AdminDataTableColumn<ActivityRow>[] = [
  {
    header: "User",
    render: (a) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="size-4" />
        </div>
        <div className="font-medium text-foreground">
          {a.user?.name || "Unknown"}
        </div>
      </div>
    ),
  },
  {
    header: "Activity Type",
    render: (a) => (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
        {a.type}
      </span>
    ),
  },
  {
    header: "Description",
    render: (a) => (
      <span className="text-muted-foreground">{a.description || "-"}</span>
    ),
  },
  {
    header: "Date",
    render: (a) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(a.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

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
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load activity logs. Please try again.
        </p>
      </div>
    );
  }

  if ((data as { success?: boolean }).success === false) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          {(data as { message?: string }).message || "API Error"}
        </p>
      </div>
    );
  }

  const activities = data.activities || [];

  const filtered = activities.filter((a: ActivityRow) => {
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
      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        emptyMessage="No activity logs found."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by user, type, or description..."
        exportCsv={() => exportAdminData(userId!, "activity")}
      />
    </div>
  );
}
