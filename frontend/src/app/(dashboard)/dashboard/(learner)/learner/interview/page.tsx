import Interview from "@/src/components/interview/Interview";

export const metadata = {
  title: "Mock Interview",
};

const InterviewPage = () => {
  return (
    <div className="flex flex-col min-h-[94vh] justify-center">
      <Interview />
    </div>
  );
};

export default InterviewPage;
