import { Metadata } from "next";
import AdminCareerReadinessView from "@/src/components/dashboard/admin/AdminCareerReadinessView";

export const metadata: Metadata = {
  title: "Career Readiness | Admin | AI Pather",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Career <span className="text-brand">Readiness</span></h1>
          <p className="section-subtitle mt-1 text-left">Assess learner preparedness for target career roles.</p>
        </div>
      </div>
      <AdminCareerReadinessView />
    </div>
  );
}
