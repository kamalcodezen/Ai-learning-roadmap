import UserManagement from "@/src/components/dashboard/admin/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">User <span className="text-brand">Management</span></h1>
          <p className="section-subtitle mt-1 text-left">Manage roles, permissions, and accounts across the platform.</p>
        </div>
      </div>
      
      <UserManagement />
    </div>
  );
}
