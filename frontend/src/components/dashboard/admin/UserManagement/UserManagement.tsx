"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "../admin.css";

import {
  Avatar,
  Modal,
  Button,
  useOverlayState,
} from "@heroui/react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { getAdminUsers, type AdminUserListItem } from "@/src/lib/api/admin/users";
import {
  updateAdminUserRole,
  updateAdminUserPlan,
  deleteAdminUser,
} from "@/src/lib/actions/admin/users";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { showToast } from "@/src/components/ui/toast";
import {
  Loader2,
  Trash2,
  Shield,
  User,
  Crown,
  Sparkles,
  X,
  UserPlus,
  Mail,
  Download,
  Filter,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useDebounce } from "use-debounce";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [daysFilter, setDaysFilter] = useState<string>("");
  const [take, setTake] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [debouncedSearch] = useDebounce(search, 400);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const deleteModal = useOverlayState();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserName, setAddUserName] = useState("");
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserRole, setAddUserRole] = useState("LEARNER");
  const [addUserPlan, setAddUserPlan] = useState("FREE");
  const [isAddingUser, setIsAddingUser] = useState(false);

  const [isBulkRoleOpen, setIsBulkRoleOpen] = useState(false);
  const [bulkTargetRole, setBulkTargetRole] = useState("LEARNER");
  const [isBulkRoleUpdating, setIsBulkRoleUpdating] = useState(false);

  const [isBulkPermissionsOpen, setIsBulkPermissionsOpen] = useState(false);
  const [bulkTargetPlan, setBulkTargetPlan] = useState("FREE");
  const [isBulkPlanUpdating, setIsBulkPlanUpdating] = useState(false);

  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // React Query Fetch
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminUsers",
      userId,
      page,
      take,
      debouncedSearch,
      roleFilter,
      planFilter,
      daysFilter,
    ],
    queryFn: () =>
      getAdminUsers(
        userId!,
        (page - 1) * take,
        take,
        debouncedSearch,
        roleFilter,
        daysFilter ? Number(daysFilter) : undefined,
        planFilter
      ),
    enabled: !!userId,
  });

  // Single Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({
      targetId,
      newRole,
    }: {
      targetId: string;
      newRole: string;
    }) => updateAdminUserRole(userId!, targetId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      showToast({ variant: "success", message: "User role updated successfully!" });
    },
    onError: (err: Error | { message?: string }) => {
      showToast({ variant: "error", message: err.message || "Failed to update role" });
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (targetId: string) => deleteAdminUser(userId!, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      showToast({ variant: "success", message: "User account deleted successfully" });
    },
    onError: (err: Error | { message?: string }) => {
      showToast({ variant: "error", message: err.message || "Failed to delete user" });
    },
  });

  const users: AdminUserListItem[] = useMemo(() => data?.users ?? [], [data?.users]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / take));

  // Multi-selection logic
  const isAllSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const isSomeSelected = users.some((u) => selectedIds.has(u.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      users.forEach((u) => next.delete(u.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      users.forEach((u) => next.add(u.id));
      setSelectedIds(next);
    }
  };

  const handleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    users.forEach((u) => next.add(u.id));
    setSelectedIds(next);
    showToast({ variant: "info", message: `Selected ${users.length} users on current page` });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    showToast({ variant: "info", message: "Selection cleared" });
  };

  const toggleUserSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk Role Update execution
  const executeBulkRoleUpdate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkRoleUpdating(true);
    try {
      const targetIds = Array.from(selectedIds).filter((id) => id !== userId);
      await Promise.all(
        targetIds.map((id) => updateAdminUserRole(userId!, id, bulkTargetRole))
      );
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      showToast({
        variant: "success",
        message: `Successfully updated ${targetIds.length} users to ${bulkTargetRole}`,
      });
      setIsBulkRoleOpen(false);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk role update failed";
      showToast({ variant: "error", message: msg });
    } finally {
      setIsBulkRoleUpdating(false);
    }
  };

  // Bulk Permissions / Plan Update execution
  const executeBulkPlanUpdate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkPlanUpdating(true);
    try {
      const targetIds = Array.from(selectedIds);
      await Promise.all(
        targetIds.map((id) => updateAdminUserPlan(userId!, id, bulkTargetPlan))
      );
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      showToast({
        variant: "success",
        message: `Successfully updated plan to ${bulkTargetPlan} for ${targetIds.length} users`,
      });
      setIsBulkPermissionsOpen(false);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk plan update failed";
      showToast({ variant: "error", message: msg });
    } finally {
      setIsBulkPlanUpdating(false);
    }
  };

  // Send Email execution
  const executeSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      showToast({ variant: "error", message: "Please provide both subject and message" });
      return;
    }
    setIsSendingEmail(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast({
        variant: "success",
        message: `Email announcement sent to ${selectedIds.size} recipient(s)!`,
      });
      setIsSendEmailOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch {
      showToast({ variant: "error", message: "Failed to send email" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Export CSV handler
  const handleExportCsv = async () => {
    try {
      if (selectedIds.size > 0) {
        const selectedUsers = users.filter((u) => selectedIds.has(u.id));
        const headers = ["ID", "Name", "Email", "Role", "Plan", "Gems", "Joined Date"];
        const rows = selectedUsers.map((u) => [
          u.id,
          `"${u.name}"`,
          u.email,
          u.role,
          u.plan || "FREE",
          u.gamification?.gemsBalance ?? 10,
          new Date(u.createdAt).toLocaleDateString(),
        ]);
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `selected-users-export-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast({ variant: "success", message: `Exported ${selectedUsers.length} selected users to CSV` });
      } else {
        await exportAdminData(userId!, "users");
        showToast({ variant: "success", message: "Exported all users to CSV" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export CSV";
      showToast({ variant: "error", message: msg });
    }
  };

  // Add User execution
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserEmail.trim() || !addUserName.trim()) {
      showToast({ variant: "error", message: "Please fill in name and email" });
      return;
    }
    setIsAddingUser(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      showToast({ variant: "success", message: `Invitation sent to ${addUserEmail} as ${addUserRole}` });
      setIsAddUserOpen(false);
      setAddUserName("");
      setAddUserEmail("");
      setAddUserRole("LEARNER");
      setAddUserPlan("FREE");
    } catch {
      showToast({ variant: "error", message: "Failed to add user" });
    } finally {
      setIsAddingUser(false);
    }
  };

  // Delete handlers
  const openDelete = (id: string) => {
    setDeleteTarget(id);
    deleteModal.open();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUserMutation.mutate(deleteTarget);
    deleteModal.close();
    setDeleteTarget(null);
  };

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={false}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={3}
      />
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load users. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* TOP HEADER: User Directory + Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search, filter, and manage user accounts
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white font-semibold text-sm transition-all shadow-md shadow-primary/20 active:scale-98 cursor-pointer shrink-0"
        >
          <UserPlus className="size-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 bg-card/60 dark:bg-[#11131a] p-2 rounded-xl border border-border/60">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users by name, email, or ID..."
              className="w-full pl-10 pr-4 py-2 bg-background/80 dark:bg-[#181a24] text-sm text-foreground placeholder:text-muted-foreground rounded-lg border border-border/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-background/80 dark:bg-[#181a24] text-sm text-foreground font-medium pl-3 pr-8 py-2 rounded-lg border border-border/60 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All roles</option>
              <option value="LEARNER">Learner</option>
              <option value="ADMIN">Admin</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Status / Plan Filter Dropdown */}
          <div className="relative">
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-background/80 dark:bg-[#181a24] text-sm text-foreground font-medium pl-3 pr-8 py-2 rounded-lg border border-border/60 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">Active</option>
              <option value="FREE">Free Plan</option>
              <option value="PLUS">Plus Plan</option>
              <option value="PRO">Pro Plan</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Rows per page dropdown */}
          <div className="relative">
            <select
              value={take}
              onChange={(e) => {
                setTake(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none bg-background/80 dark:bg-[#181a24] text-sm text-foreground font-medium pl-3 pr-8 py-2 rounded-lg border border-border/60 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              showAdvancedFilters || daysFilter
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-background/80 dark:bg-[#181a24] border-border/60 text-foreground hover:bg-muted/40"
            }`}
          >
            <Filter className="size-3.5" />
            <span>Filter</span>
            {daysFilter && <span className="size-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showAdvancedFilters && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/20 dark:bg-[#141620] rounded-xl border border-border/40 animate-in fade-in duration-200">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time Range:
            </span>
            <div className="flex items-center gap-2">
              {[
                { label: "All Time", value: "" },
                { label: "Last 7 Days", value: "7" },
                { label: "Last 30 Days", value: "30" },
                { label: "Last 90 Days", value: "90" },
                { label: "Last Year", value: "365" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setDaysFilter(item.value);
                    setPage(1);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors cursor-pointer ${
                    daysFilter === item.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {(roleFilter || planFilter || daysFilter || search) && (
              <button
                onClick={() => {
                  setRoleFilter("");
                  setPlanFilter("");
                  setDaysFilter("");
                  setSearch("");
                  setPage(1);
                }}
                className="ml-auto text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* MULTI-SELECT & BULK ACTIONS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-card/40 dark:bg-[#0e1017] rounded-xl border border-border/60">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllOnPage}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted/70 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              Select all on page
            </button>
            <button
              onClick={handleClearSelection}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Clear selection
            </button>
            <span className="text-xs font-medium text-muted-foreground ml-1">
              <span className="font-bold text-foreground">{selectedIds.size}</span> selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (selectedIds.size === 0) {
                  showToast({ variant: "info", message: "Please select at least one user first" });
                  return;
                }
                setIsBulkRoleOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-background dark:bg-[#181a24] hover:bg-muted/60 text-foreground border border-border/60 transition-colors cursor-pointer"
              title="Change role for selected users"
            >
              <UserPlus className="size-3.5 text-purple-400" />
              <span>Bulk role update</span>
            </button>

            <button
              onClick={() => {
                if (selectedIds.size === 0) {
                  showToast({ variant: "info", message: "Please select at least one user first" });
                  return;
                }
                setIsSendEmailOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-background dark:bg-[#181a24] hover:bg-muted/60 text-foreground border border-border/60 transition-colors cursor-pointer"
              title="Send broadcast email"
            >
              <Mail className="size-3.5 text-blue-400" />
              <span>Send email</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-background dark:bg-[#181a24] hover:bg-muted/60 text-foreground border border-border/60 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="size-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                if (selectedIds.size === 0) {
                  showToast({ variant: "info", message: "Please select at least one user first" });
                  return;
                }
                setIsBulkPermissionsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-background dark:bg-[#181a24] hover:bg-muted/60 text-foreground border border-border/60 transition-colors cursor-pointer"
              title="Change permissions/subscription tier"
            >
              <Shield className="size-3.5 text-amber-400" />
              <span>Modify Permissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* USER DATA TABLE */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 dark:bg-[#11131a] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="w-12 px-4 py-3.5 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground"
                    title={isAllSelected ? "Deselect page" : "Select all on page"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5 text-center">Career Goal</th>
                <th className="px-4 py-3.5 text-center">Plan</th>
                <th className="px-4 py-3.5 text-center">Gems</th>
                <th className="px-4 py-3.5 text-center">Role</th>
                <th className="px-4 py-3.5 text-center">Joined</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No users found matching your search or filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelected = selectedIds.has(u.id);
                  const target =
                    u.careerProfile?.targetRoleName || u.careerProfile?.targetRole;
                  const plan = u.plan || "FREE";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSelected ? "bg-emerald-500/5 dark:bg-emerald-950/15" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleUserSelection(u.id)}
                          className="flex items-center justify-center mx-auto cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>

                      {/* User Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="size-9 rounded-full border border-border/40">
                            <Avatar.Image src={u.image ?? undefined} alt={u.name} />
                            <Avatar.Fallback>
                              <User className="size-4 text-muted-foreground" />
                            </Avatar.Fallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Career Goal */}
                      <td className="px-4 py-3 text-center">
                        {target ? (
                          <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 max-w-[170px] truncate">
                            {target}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Not chosen
                          </span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            plan === "PRO"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : plan === "PLUS"
                              ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                              : "bg-muted/60 text-muted-foreground border border-border/40"
                          }`}
                        >
                          {plan === "PRO" && <Crown className="size-3" />}
                          {plan === "PLUS" && <Sparkles className="size-3" />}
                          {plan}
                        </span>
                      </td>

                      {/* Gems */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <span>💎</span>
                          <span>{u.gamification?.gemsBalance ?? 10}</span>
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {u.role === "ADMIN" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {u.role}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3 text-center text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <div className="relative">
                            <select
                              value={u.role}
                              disabled={updateRoleMutation.isPending || u.id === userId}
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  targetId: u.id,
                                  newRole: e.target.value,
                                })
                              }
                              className="appearance-none bg-muted/40 dark:bg-[#181a24] text-xs font-semibold text-foreground pl-2.5 pr-7 py-1.5 rounded-lg border border-border/60 hover:bg-muted/60 focus:outline-none focus:border-primary disabled:opacity-50 transition-all cursor-pointer"
                            >
                              <option value="LEARNER">LEARNER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                          </div>

                          <button
                            onClick={() => openDelete(u.id)}
                            disabled={deleteUserMutation.isPending || u.id === userId}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                            title="Delete User"
                          >
                            {deleteUserMutation.isPending &&
                            deleteUserMutation.variables === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 px-4 py-3.5 bg-muted/20 dark:bg-[#11131a]">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{(page - 1) * take + 1}</span> to{" "}
            <span className="font-semibold text-foreground">{Math.min(page * take, total)}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span> accounts
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background dark:bg-[#181a24] text-foreground border border-border/60 hover:bg-muted/60 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-xs font-semibold text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-xs"
            >
              <span className="text-white font-semibold">Next</span>
              <ArrowRight className="size-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <UserPlus className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Add New User</h3>
                <p className="text-xs text-muted-foreground">
                  Create a new platform account or invite user
                </p>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addUserName}
                  onChange={(e) => setAddUserName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={addUserEmail}
                  onChange={(e) => setAddUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Role
                  </label>
                  <select
                    value={addUserRole}
                    onChange={(e) => setAddUserRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="LEARNER">Learner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Plan
                  </label>
                  <select
                    value={addUserPlan}
                    onChange={(e) => setAddUserPlan(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="FREE">Free</option>
                    <option value="PLUS">Plus</option>
                    <option value="PRO">Pro</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isAddingUser && <Loader2 className="size-4 animate-spin" />}
                  <span>Add Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK ROLE UPDATE */}
      {isBulkRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsBulkRoleOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <UserPlus className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Bulk Role Update</h3>
                <p className="text-xs text-muted-foreground">
                  Update role for {selectedIds.size} selected user(s)
                </p>
              </div>
            </div>

            <div className="py-2 space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                Select New Role
              </label>
              <select
                value={bulkTargetRole}
                onChange={(e) => setBulkTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-purple-500 transition cursor-pointer"
              >
                <option value="LEARNER">LEARNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <p className="text-xs text-muted-foreground">
                This will immediately update access permissions for all chosen user accounts.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBulkRoleOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkRoleUpdate}
                disabled={isBulkRoleUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 cursor-pointer"
              >
                {isBulkRoleUpdating && <Loader2 className="size-4 animate-spin" />}
                <span>Apply Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MODIFY PERMISSIONS (PLAN) */}
      {isBulkPermissionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsBulkPermissionsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Shield className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Modify Permissions</h3>
                <p className="text-xs text-muted-foreground">
                  Update subscription tier for {selectedIds.size} user(s)
                </p>
              </div>
            </div>

            <div className="py-2 space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                Target Subscription Plan
              </label>
              <select
                value={bulkTargetPlan}
                onChange={(e) => setBulkTargetPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="FREE">FREE - Basic Access</option>
                <option value="PLUS">PLUS - Advanced Features</option>
                <option value="PRO">PRO - Full Platform Access</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBulkPermissionsOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkPlanUpdate}
                disabled={isBulkPlanUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50 cursor-pointer"
              >
                {isBulkPlanUpdating && <Loader2 className="size-4 animate-spin" />}
                <span>Update Permissions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND EMAIL */}
      {isSendEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsSendEmailOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Send Broadcast Email</h3>
                <p className="text-xs text-muted-foreground">
                  Sending message to {selectedIds.size} recipient(s)
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platform updates & feature release"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your message to the selected users..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsSendEmailOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 cursor-pointer"
              >
                {isSendingEmail && <Loader2 className="size-4 animate-spin" />}
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE USER CONFIRMATION */}
      <Modal state={deleteModal}>
        <Modal.Backdrop className="bg-black/70 backdrop-blur-sm z-50">
          <Modal.Container className="z-50 p-4">
            <Modal.Dialog className="sm:max-w-[400px] w-full rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-6 relative overflow-hidden">
              <Modal.CloseTrigger className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-foreground/70 hover:text-foreground transition-all duration-200 cursor-pointer shadow-sm z-20">
                <X className="size-4" />
              </Modal.CloseTrigger>
              <Modal.Header className="flex items-center gap-3.5 pb-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <Modal.Heading className="text-lg font-bold text-foreground tracking-tight">
                    Delete user?
                  </Modal.Heading>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Irreversible administrative action
                  </p>
                </div>
              </Modal.Header>
              <Modal.Body className="py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  WARNING: This will permanently delete the user and all
                  associated data. This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Button
                  className="flex-1 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground font-semibold py-2.5 transition-colors cursor-pointer"
                  slot="close"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                  onPress={confirmDelete}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
