"use client";

import AdminGuard from "@/src/components/dashboard/admin/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
