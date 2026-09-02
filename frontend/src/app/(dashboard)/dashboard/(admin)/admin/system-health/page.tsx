import AdminSystemHealthView from "@/src/components/dashboard/admin/AdminSystemHealthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Health | Admin | AI Pather",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">System <span className="text-brand">Health</span></h1>
          <p className="section-subtitle mt-1 text-left">Monitor the status of all platform services.</p>
        </div>
      </div>
      <AdminSystemHealthView />
    </div>
  );
}
