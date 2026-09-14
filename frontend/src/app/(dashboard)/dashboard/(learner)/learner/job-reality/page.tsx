import JobRealityContent from "@/src/components/dashboard/learner/job-reality/JobRealityContent";
import PlanGuard from "@/src/components/dashboard/shared/PlanGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Reality",
};

export default function JobRealityPage() {
  return (
    <PlanGuard requiredPlan="PLUS">
      <JobRealityContent />
    </PlanGuard>
  );
}
