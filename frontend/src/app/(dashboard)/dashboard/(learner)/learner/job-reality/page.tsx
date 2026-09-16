import JobRealityContent from "@/src/components/dashboard/learner/job-reality/JobRealityContent";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Reality & Market Demand",
};

export default function JobRealityPage() {
  return (
    <FeatureLockedOverlay
      featureName="Job Reality & Market Demand"
      requiredPlan="PLUS"
      description="Access live tech market intelligence, regional hiring velocity, real-time salary distributions, and in-demand skill requirements."
    >
      <JobRealityContent />
    </FeatureLockedOverlay>
  );
}
