import AdminSkillHealthView from "@/src/components/dashboard/admin/AdminSkillHealthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Health | Admin | AI Pather",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Skill <span className="text-brand">Health</span></h1>
          <p className="section-subtitle mt-1 text-left">Overview of strong and weak skills across learners.</p>
        </div>
      </div>
      <AdminSkillHealthView />
    </div>
  );
}
