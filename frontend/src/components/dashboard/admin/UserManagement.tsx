"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers } from "@/src/lib/api/admin/users";
import { updateAdminUserRole, deleteAdminUser } from "@/src/lib/actions/admin/users";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Search, Loader2, Trash2, Shield, User } from "lucide-react";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";
import { useDebounce } from "use-debounce";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState<number | "">("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const take = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers", userId, page, debouncedSearch, roleFilter, daysFilter],
    queryFn: () => getAdminUsers(userId!, page * take, take, debouncedSearch, roleFilter, daysFilter || undefined),
    enabled: !!userId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ targetId, newRole }: { targetId: string; newRole: string }) =>
      updateAdminUserRole(userId!, targetId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: Error | { message?: string }) => {
      alert(err.message || "Failed to update role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (targetId: string) => deleteAdminUser(userId!, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: Error | { message?: string }) => {
      alert(err.message || "Failed to delete user");
    },
  });

  if (isLoading && !data) {
    return <GenericPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load users. Please try again.</p>
      </div>
    );
  }

  const { users, total } = data;
  const totalPages = Math.ceil(total / take);

  const handleRoleChange = (id: string, newRole: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      updateRoleMutation.mutate({ targetId: id, newRole });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("WARNING: This will permanently delete the user and all associated data. This action cannot be undone. Are you sure?")) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Roles</option>
          <option value="LEARNER">Learner</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={daysFilter}
          onChange={(e) => { setDaysFilter(e.target.value ? Number(e.target.value) : ""); setPage(0); }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Any Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
        <button
          onClick={() => exportAdminData(userId!, 'users')}
          className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'}`}>
                      {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select
                        className="text-xs bg-background border border-input rounded p-1 cursor-pointer"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updateRoleMutation.isPending || u.id === userId}
                      >
                        <option value="LEARNER">LEARNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleteUserMutation.isPending || u.id === userId}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete User"
                      >
                        {(deleteUserMutation.isPending && deleteUserMutation.variables === u.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * take + 1} to {Math.min((page + 1) * take, total)} of {total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
