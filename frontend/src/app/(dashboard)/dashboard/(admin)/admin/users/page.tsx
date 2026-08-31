import UserManagement from "@/src/components/dashboard/admin/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin | AI Pather",
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl pb-24 lg:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage roles, permissions, and accounts across the platform.</p>
        </div>
      </div>
      
      <UserManagement />
    </div>
  );
}
