import AdminAssessmentsView from "@/src/components/dashboard/admin/AdminAssessmentsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessments",
};

export default function AdminAssessmentsPage() {
  return <AdminAssessmentsView />;
}
