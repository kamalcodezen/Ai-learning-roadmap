import AdminRoadmapsView from "@/src/components/dashboard/admin/AdminRoadmapsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmaps | Admin | AI Pather",
};

export default function AdminRoadmapsPage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Learners <span className="text-brand">Roadmaps</span></h1>
          <p className="section-subtitle mt-1 text-left">Manage and track learner roadmaps across the platform.</p>
        </div>
      </div>
      <AdminRoadmapsView />
    </div>
  );
}
