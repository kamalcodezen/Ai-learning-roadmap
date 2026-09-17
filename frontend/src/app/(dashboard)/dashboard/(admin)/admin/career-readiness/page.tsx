import { Metadata } from "next";
import AdminCareerReadinessView from "@/src/components/dashboard/admin/AdminCareerReadinessView";

export const metadata: Metadata = {
  title: "Career Readiness",
};

export default function Page() {
  return <AdminCareerReadinessView />;
}
