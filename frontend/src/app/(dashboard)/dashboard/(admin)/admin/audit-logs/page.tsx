import AuditLogsView from "@/src/components/dashboard/admin/AuditLogsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Audit <span className="text-brand">Logs</span></h1>
          <p className="section-subtitle mt-1 text-left">View security and administrative actions taken across the platform.</p>
        </div>
      </div>
      <AuditLogsView />
    </div>
  );
}
