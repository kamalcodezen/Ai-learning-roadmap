import AdminAssessmentsView from "@/src/components/dashboard/admin/AdminAssessmentsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessments",
};

export default function AdminAssessmentsPage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Assessment <span className="text-brand">Analytics</span></h1>
          <p className="section-subtitle mt-1 text-left">Review platform-wide assessment attempts, completion and performance.</p>
        </div>
      </div>
      <AdminAssessmentsView />
    </div>
  );
}
