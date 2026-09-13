"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProjects } from "@/src/lib/api/admin/projects";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { FolderKanban, User, ExternalLink, GitBranch } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Key, Label, ListBox, Select, Skeleton } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface ProjectRow {
  id: string;
  title: string;
  difficulty: string;
  completionRate: number;
  activeUsers: number;
  description: string;
  user: { name: string; email: string };
  score: number;
  repositoryUrl: string;
  liveUrl: string;
  createdAt: string;
}

const columns: AdminDataTableColumn<ProjectRow>[] = [
  {
    header: "Project",
    render: (p) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderKanban className="size-4" />
        </div>
        <div>
          <p className="font-medium text-foreground">{p.title}</p>
          {p.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {p.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: "Learner",
    render: (p) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{p.user.name}</p>
          <p className="text-xs text-muted-foreground">{p.user.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Score",
    render: (p) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          p.score >= 80
            ? "bg-green-500/10 text-green-500"
            : p.score >= 50
              ? "bg-orange-500/10 text-orange-500"
              : "bg-red-500/10 text-red-500"
        }`}
      >
        {p.score}%
      </span>
    ),
  },
  {
    header: "Evidence",
    render: (p) => (
      <div className="flex items-center gap-3">
        {p.repositoryUrl ? (
          <a
            href={p.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Git Repository"
          >
            <GitBranch className="h-4 w-4" />
          </a>
        ) : (
          <GitBranch className="h-4 w-4 opacity-20" />
        )}
        {p.liveUrl ? (
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Live Deployment"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <ExternalLink className="h-4 w-4 opacity-20" />
        )}
      </div>
    ),
  },
  {
    header: "Date",
    render: (p) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(p.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default function AdminProjectsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminProjects",
      userId,
      skip,
      take,
      debouncedSearch,
      daysFilter,
    ],
    queryFn: () =>
      getAdminProjects(
        userId!,
        skip,
        take,
        debouncedSearch,
        daysFilter ? Number(daysFilter) : undefined,
      ),
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
          Unable to load projects. Please try again.
        </p>
      </div>
    );
  }

  const { projects, total } = data;

  return (
    <div className="space-y-6">
      <AdminDataTable
        columns={columns}
        rows={projects}
        rowKey={(p) => p.id}
        emptyMessage="No projects found."
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search projects by title..."
        toolbar={
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
        }
        exportCsv={() => exportAdminData(userId!, "projects")}
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
