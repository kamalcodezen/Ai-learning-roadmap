import { Metadata } from "next";
import AdminSkillProofView from "@/src/components/dashboard/admin/AdminSkillProofView";

export const metadata: Metadata = {
  title: "Skill Proof | Admin | AI Pather",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Skill <span className="text-brand">Proof</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Review submitted skill proofs and scores across the platform.
          </p>
        </div>
      </div>
      <AdminSkillProofView />
    </div>
  );
}
