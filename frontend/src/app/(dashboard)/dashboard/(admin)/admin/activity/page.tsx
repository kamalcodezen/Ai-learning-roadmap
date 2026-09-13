import { Metadata } from "next";
import AdminActivityView from "@/src/components/dashboard/admin/AdminActivityView";

export const metadata: Metadata = {
  title: "System Activity",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">System <span className="text-brand">Activity</span></h1>
          <p className="section-subtitle mt-1 text-left">Monitor user actions and system events across the platform.</p>
        </div>
      </div>
      <AdminActivityView />
    </div>
  );
}
