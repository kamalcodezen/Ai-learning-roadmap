import type { Metadata } from "next";
import ApplicationReadinessPage from "@/src/components/dashboard/learner/application-readiness/ApplicationReadinessPage";

export const metadata: Metadata = {
  title: "Application Readiness",
  description: "Evaluate your job-readiness score against current industry hiring bars and job postings.",
};

export default function Page() {
  return <ApplicationReadinessPage />;
}
