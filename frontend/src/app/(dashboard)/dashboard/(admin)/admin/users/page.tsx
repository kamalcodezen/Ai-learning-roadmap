import UserManagement from "@/src/components/dashboard/admin/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
