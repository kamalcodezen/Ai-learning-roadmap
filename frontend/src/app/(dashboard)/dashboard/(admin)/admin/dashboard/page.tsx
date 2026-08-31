import DashboardStats from "@/src/components/dashboard/admin/DashboardStats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | AI Pather",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl pb-24 lg:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor platform health and user activity.</p>
        </div>
      </div>
      
      <DashboardStats />
    </div>
  );
}
