import type { Metadata } from "next";
import AdminGuard from "@/src/components/dashboard/admin/AdminGuard";

export const metadata: Metadata = {
  title: {
    default: "Admin Console",
    template: "%s | Admin | AI Pather",
  },
  description: "AI Pather administrative control center, system telemetry, and platform management.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
