import { ResumeStudio } from "@/src/components/resume/ResumeStudio";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";

export const metadata = {
  title: "AI Resume & ATS Optimizer",
  description: "Build, analyze, and optimize your technical resume for ATS parsers and top recruiters.",
};

const ResumePage = () => {
  return (
    <FeatureLockedOverlay
      featureName="AI Resume & ATS Optimizer"
      requiredPlan="PRO"
      description="Build, optimize, and scan your resume against live ATS recruiter filters with AI bullet rewrites and job keyword alignment."
    >
      <div className="flex flex-col min-h-[94vh]">
        <ResumeStudio />
      </div>
    </FeatureLockedOverlay>
  );
};

export default ResumePage;
