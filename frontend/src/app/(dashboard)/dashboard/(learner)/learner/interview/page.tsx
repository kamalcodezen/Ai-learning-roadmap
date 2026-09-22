import Interview from "@/src/components/interview/Interview";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";

export const metadata = {
  title: "Mock Interview",
};

const InterviewPage = () => {
  return (
    <FeatureLockedOverlay
      featureName="AI Mock Interview Simulator"
      requiredPlan="PLUS"
      description="Practice real-world technical and behavioral interviews with real-time AI audio analysis, scenario scoring, and tailored feedback."
    >
      <div className="w-full flex flex-col">
        <Interview />
      </div>
    </FeatureLockedOverlay>
  );
};

export default InterviewPage;

