import { Metadata } from "next";
import AdminJobRealityView from "@/src/components/dashboard/admin/AdminJobRealityView";

export const metadata: Metadata = {
  title: "Job Reality",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Job <span className="text-brand">Reality</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Explore popular roles and job-market alignment for learners.
          </p>
        </div>
      </div>
      <AdminJobRealityView />
    </div>
  );
}
