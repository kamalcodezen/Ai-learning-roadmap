import type { Metadata } from "next";
import AdminInterviewsView from "@/src/components/dashboard/admin/AdminInterviewsView/AdminInterviewsView";

export const metadata: Metadata = {
  title: "Mock Interviews",
  description: "Supervise learner voice & text mock interview sessions, questions, and AI evaluations.",
};

export default function Page() {
  return <AdminInterviewsView />;
}
