import DashboardStats from "@/src/components/dashboard/admin/DashboardStats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Administrative dashboard with key platform metrics, learner activity, and system status.",
};

export default function AdminDashboardPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <DashboardStats />
    </div>
  );
}
