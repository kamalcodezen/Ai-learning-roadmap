import Interview from "@/src/components/interview/Interview";
import PlanGuard from "@/src/components/dashboard/shared/PlanGuard";

export const metadata = {
  title: "Mock Interview",
};

const InterviewPage = () => {
  return (
    <PlanGuard requiredPlan="PLUS">
      <div className="flex flex-col min-h-[94vh] justify-center">
        <Interview />
      </div>
    </PlanGuard>
  );
};

export default InterviewPage;
