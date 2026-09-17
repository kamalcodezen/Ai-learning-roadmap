"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Key } from "@heroui/react";
import "../admin.css";

import {
  Avatar,
  Modal,
  Button,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { getAdminUsers } from "@/src/lib/api/admin/users";
import {
  updateAdminUserRole,
  updateAdminUserPlan,
  deleteAdminUser,
} from "@/src/lib/actions/admin/users";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Loader2, Trash2, Shield, User, Crown, Sparkles } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useOverlayState } from "@heroui/react";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface UserRow {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  plan?: string;
  createdAt: string;
  careerProfile?: {
    targetRole?: string;
    targetRoleName?: string;
  } | null;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Key | null>(null);
  const [planFilter, setPlanFilter] = useState<Key | null>(null);
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const take = 10;

  const deleteModal = useOverlayState();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminUsers",
      userId,
      page,
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
        roleFilter ? String(roleFilter) : "",
        daysFilter ? Number(daysFilter) : undefined,
        planFilter ? String(planFilter) : "",
      ),
    enabled: !!userId,
  });

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

  const { users, total } = data;

  const handleRoleChange = (id: string, newRole: string) => {
    updateRoleMutation.mutate({ targetId: id, newRole });
  };


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

  const columns: AdminDataTableColumn<UserRow>[] = [
    {
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <Avatar.Image src={u.image ?? undefined} alt={u.name} />
            <Avatar.Fallback>
              <User className="size-4" />
            </Avatar.Fallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Career Goal",
      align: "center",
      render: (u) => {
        const target = u.careerProfile?.targetRoleName || u.careerProfile?.targetRole;
        return target ? (
          <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 max-w-[170px] truncate">
            {target}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Not chosen</span>
        );
      },
    },
    {
      header: "Plan",
      align: "center",
      render: (u) => {
        const plan = u.plan || "FREE";
        return (
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
        );
      },
    },
    {
      header: "Role",
      align: "center",
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-purple-500/10 text-purple-500" : "bg-primary/10 text-primary"}`}
        >
          {u.role === "ADMIN" ? (
            <Shield className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
          {u.role}
        </span>
      ),
    },
    {
      header: "Joined",
      align: "center",
      render: (u) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "center",
      render: (u) => (
        <div className="inline-flex items-center justify-center gap-2.5">
          <Select
            className="w-28 text-left"
            value={u.role}
            isDisabled={updateRoleMutation.isPending || u.id === userId}
            onChange={(val) => handleRoleChange(u.id, String(val))}
          >
            <Select.Trigger
              className="rounded-lg! [border-radius:0.5rem]!"
              style={{ borderRadius: "0.5rem" }}
            >
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover
              className="rounded-lg! [border-radius:0.5rem]!"
              style={{ borderRadius: "0.5rem" }}
            >
              <ListBox>
                <ListBox.Item key="LEARNER" id="LEARNER" textValue="LEARNER">
                  LEARNER
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item key="ADMIN" id="ADMIN" textValue="ADMIN">
                  ADMIN
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <button
            onClick={() => openDelete(u.id)}
            disabled={deleteUserMutation.isPending || u.id === userId}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center shrink-0 cursor-pointer"
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
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">User <span className="text-brand">Management</span></h1>
          <p className="section-subtitle mt-1 text-left">Manage roles, permissions, and accounts across the platform.</p>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        emptyMessage="No users found matching your search."
        searchTerm={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email..."
        toolbar={
          <>
            <Select
              className="w-full sm:w-36"
              placeholder="All Roles"
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <Label>Role</Label>
              <Select.Trigger
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
                <ListBox>
                  <ListBox.Item key="LEARNER" id="LEARNER" textValue="Learner">
                    Learner
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="ADMIN" id="ADMIN" textValue="Admin">
                    Admin
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
            <Select
              className="w-full sm:w-36"
              placeholder="All Plans"
              value={planFilter}
              onChange={(val) => {
                setPlanFilter(val);
                setPage(1);
              }}
            >
              <Label>Plan</Label>
              <Select.Trigger
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
                <ListBox>
                  <ListBox.Item key="FREE" id="FREE" textValue="Free">
                    Free
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="PLUS" id="PLUS" textValue="Plus">
                    Plus
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="PRO" id="PRO" textValue="Pro">
                    Pro
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
              <Select.Trigger
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover
                className="rounded-lg! [border-radius:0.5rem]!"
                style={{ borderRadius: "0.5rem" }}
              >
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
        exportCsv={() => exportAdminData(userId!, "users")}
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />

      <Modal state={deleteModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-red-500/10 text-red-500">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Delete user?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>
                  WARNING: This will permanently delete the user and all
                  associated data. This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" slot="close" fullWidth>
                  Cancel
                </Button>
                <Button variant="danger" onPress={confirmDelete} fullWidth>
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
