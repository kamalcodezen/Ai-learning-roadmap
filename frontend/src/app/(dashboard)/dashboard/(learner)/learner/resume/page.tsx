import { ResumeStudio } from "@/src/components/resume/ResumeStudio";
import PlanGuard from "@/src/components/dashboard/shared/PlanGuard";

export const metadata = {
  title: "AI Resume & ATS Optimizer",
  description: "Build, analyze, and optimize your technical resume for ATS parsers and top recruiters.",
};

const ResumePage = () => {
  return (
    <PlanGuard requiredPlan="PLUS">
      <div className="flex flex-col min-h-[94vh]">
        <ResumeStudio />
      </div>
    </PlanGuard>
  );
};

export default ResumePage;
