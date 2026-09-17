import AssessmentsPage from "@/src/components/dashboard/learner/assessments/AssessmentsPage";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";

export const metadata = {
  title: "Assessments & Skill Diagnostics",
};

export default function Page() {
  return (
    <FeatureLockedOverlay
      featureName="Skill Assessments & Diagnostics"
      requiredPlan="PLUS"
      description="Take targeted competency evaluations, milestone quizzes, and scenario challenges with tailored scoring and feedback."
    >
      <AssessmentsPage />
    </FeatureLockedOverlay>
  );
}
