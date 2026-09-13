import { ResumeStudio } from "@/src/components/resume/ResumeStudio";

export const metadata = {
  title: "AI Resume & ATS Optimizer",
  description: "Build, analyze, and optimize your technical resume for ATS parsers and top recruiters.",
};

const ResumePage = () => {
  return (
    <div className="flex flex-col min-h-[94vh]">
      <ResumeStudio />
    </div>
  );
};

export default ResumePage;
