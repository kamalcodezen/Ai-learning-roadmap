import AdminSkillHealthView from "@/src/components/dashboard/admin/AdminSkillHealthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Health",
};

export default function Page() {
  return <AdminSkillHealthView />;
}
