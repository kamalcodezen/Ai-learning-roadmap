import AdminErrorLogsView from "@/src/components/dashboard/admin/AdminErrorLogsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Logs",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Error <span className="text-brand">Logs</span></h1>
          <p className="section-subtitle mt-1 text-left">Track and investigate system errors across the platform.</p>
        </div>
      </div>
      <AdminErrorLogsView />
    </div>
  );
}
