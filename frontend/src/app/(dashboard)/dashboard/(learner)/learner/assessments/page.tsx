import AssessmentsPage from "@/src/components/dashboard/learner/assessments/AssessmentsPage";
import PlanGuard from "@/src/components/dashboard/shared/PlanGuard";

export default function Page() {
  return (
    <PlanGuard requiredPlan="PLUS">
      <AssessmentsPage />
    </PlanGuard>
  );
}
