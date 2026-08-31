"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProjects } from "@/src/lib/api/admin/projects";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Search, FolderKanban, ArrowLeft, ArrowRight, User, ExternalLink, GitBranch } from "lucide-react";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";

import { useDebounce } from "use-debounce";

export default function AdminProjectsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState<number | "">("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProjects", userId, skip, take, debouncedSearch, daysFilter],
    queryFn: () => getAdminProjects(userId!, skip, take, debouncedSearch, daysFilter || undefined),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20">
        <p className="text-red-500 font-medium">Failed to load projects.</p>
      </div>
    );
  }

  const { projects, total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex w-full md:w-auto">
          <select
            value={daysFilter}
            onChange={(e) => { setDaysFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
            className="h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Any Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button
            onClick={() => exportAdminData(userId!, 'projects')}
            className="ml-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Learner</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Evidence</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FolderKanban className="h-8 w-8 opacity-50" />
                      <p>No projects found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((p: { id: string; title: string; difficulty: string; completionRate: number; activeUsers: number; description: string; user: { name: string; email: string }; score: number; repositoryUrl: string; liveUrl: string; createdAt: string }) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{p.title}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{p.user.name}</p>
                          <p className="text-xs text-muted-foreground">{p.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.score >= 80 ? 'bg-green-500/10 text-green-500' : 
                        p.score >= 50 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {p.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.repositoryUrl ? (
                          <a href={p.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="GitBranch Repo">
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
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > take && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {skip + 1} to {Math.min(skip + take, total)} of {total} results
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Prev
            </button>
            <button className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
