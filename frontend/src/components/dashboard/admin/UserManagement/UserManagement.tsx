"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Key } from "@heroui/react";
import "../admin.css";

import {
  Avatar,
  Skeleton,
  Modal,
  Button,
  Select,
  Label,
  ListBox,
} from "@heroui/react";
import { getAdminUsers } from "@/src/lib/api/admin/users";
import {
  updateAdminUserRole,
  deleteAdminUser,
} from "@/src/lib/actions/admin/users";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Loader2, Trash2, Shield, User } from "lucide-react";
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
  createdAt: string;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Key | null>(null);
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
      header: "Role",
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
      render: (u) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (u) => (
        <div className="flex items-center justify-end gap-3">
          <Select
            className="w-28"
            value={u.role}
            isDisabled={updateRoleMutation.isPending || u.id === userId}
            onChange={(val) => handleRoleChange(u.id, String(val))}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
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
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
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
    <>
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
              className="w-full sm:w-40"
              placeholder="All Roles"
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <Label>Role</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
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
    </>
  );
}
