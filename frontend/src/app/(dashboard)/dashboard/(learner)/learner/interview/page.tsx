import Interview from "@/src/components/interview/Interview";

export const metadata = {
  title: "Mock Interview",
  description: "Assess your career readiness with an AI mock interview.",
};

const InterviewPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Interview />
    </div>
  );
};

export default InterviewPage;
