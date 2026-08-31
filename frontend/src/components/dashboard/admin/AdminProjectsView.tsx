"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProjects } from "@/src/lib/api/admin/projects";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { FolderKanban, ArrowLeft, ArrowRight, User, ExternalLink, GitBranch } from "lucide-react";
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
    queryKey: ["adminProjects", userId, skip, take, debouncedSearch, daysFilter],
    queryFn: () => getAdminProjects(userId!, skip, take, debouncedSearch, daysFilter ? Number(daysFilter) : undefined),
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
        <p className="text-red-500 font-medium">Unable to load projects. Please try again.</p>
      </div>
    );
  }

  const { projects, total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchField
              className="flex-1 w-full max-w-md"
              value={searchTerm}
              onChange={(val) => { setSearchTerm(val); setPage(1); }}
            >
              <Label>Search</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input className="w-full" placeholder="Search projects by title..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <Select
              className="w-full sm:w-40"
              placeholder="Any Time"
              value={daysFilter}
              onChange={(val) => { setDaysFilter(val); setPage(1); }}
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
              onClick={() => exportAdminData(userId!, "projects")}
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
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Project</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Learner</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Score</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Evidence</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4">
                      <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <FolderKanban className="h-8 w-8 opacity-50" />
                        No projects found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((p: { id: string; title: string; difficulty: string; completionRate: number; activeUsers: number; description: string; user: { name: string; email: string }; score: number; repositoryUrl: string; liveUrl: string; createdAt: string }) => (
                    <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderKanban className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{p.title}</p>
                            {p.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{p.user.name}</p>
                            <p className="text-xs text-muted-foreground">{p.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.score >= 80 ? "bg-green-500/10 text-green-500" :
                          p.score >= 50 ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {p.score}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.repositoryUrl ? (
                            <a href={p.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Git Repository">
                              <GitBranch className="h-4 w-4" />
                            </a>
                          ) : (
                            <GitBranch className="h-4 w-4 opacity-20" />
                          )}
                          {p.liveUrl ? (
                            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Live Deployment">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <ExternalLink className="h-4 w-4 opacity-20" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 inline" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
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
