import { Metadata } from "next";
import AdminSkillProofView from "@/src/components/dashboard/admin/AdminSkillProofView";

export const metadata: Metadata = {
  title: "Skill Proof",
};

export default function Page() {
  return <AdminSkillProofView />;
}
