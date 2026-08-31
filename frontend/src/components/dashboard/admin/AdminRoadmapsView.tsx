"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminRoadmaps } from "@/src/lib/api/admin/roadmaps";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Search, Route, ArrowLeft, ArrowRight, User } from "lucide-react";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";

import { useDebounce } from "use-debounce";

export default function AdminRoadmapsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [debouncedRole] = useDebounce(roleFilter, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminRoadmaps", userId, skip, take, debouncedSearch, statusFilter, debouncedRole],
    queryFn: () => getAdminRoadmaps(userId!, skip, take, debouncedSearch, statusFilter, debouncedRole),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20">
        <p className="text-red-500 font-medium">Failed to load roadmaps.</p>
      </div>
    );
  }

  const { roadmaps, total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by learner name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter by target role..."
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => exportAdminData(userId!, 'roadmaps')}
            className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
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
                <th className="px-6 py-4 font-medium">Target Role</th>
                <th className="px-6 py-4 font-medium">Learner</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {roadmaps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Route className="h-8 w-8 opacity-50" />
                      <p>No roadmaps found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roadmaps.map((rm: { id: string; title: string; category: string; enrolled: number; targetRole: string; user: { name: string; email: string }; status: string; createdAt: string; milestones?: Array<{ status: string }> }) => {
                  const totalMilestones = rm.milestones?.length || 0;
                  const completedMilestones = rm.milestones?.filter((m: { status: string }) => m.status === "COMPLETED").length || 0;
                  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <tr key={rm.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {rm.targetRole}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{rm.user.name}</p>
                            <p className="text-xs text-muted-foreground">{rm.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          rm.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 
                          rm.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          {rm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(rm.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
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
