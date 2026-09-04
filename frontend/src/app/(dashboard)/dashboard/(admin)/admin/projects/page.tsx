import { Metadata } from "next";
import AdminProjectsView from "@/src/components/dashboard/admin/AdminProjectsView";

export const metadata: Metadata = {
  title: "Projects Overview",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Projects <span className="text-brand">Overview</span></h1>
          <p className="section-subtitle mt-1 text-left">Track learner projects and portfolio evidence.</p>
        </div>
      </div>
      <AdminProjectsView />
    </div>
  );
}
