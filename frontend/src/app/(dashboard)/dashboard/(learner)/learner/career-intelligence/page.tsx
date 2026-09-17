import CareerIntelligenceCard from "@/src/components/dashboard/learner/career-intelligence/CareerIntelligenceCard";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";

export const metadata = {
  title: "Career Intelligence",
  description:
    "AI-powered Career Decision Engine — data-driven decision analytics for your target career.",
};

export default function CareerIntelligencePage() {
  return (
    <FeatureLockedOverlay
      featureName="AI Career Intelligence Engine"
      requiredPlan="PRO"
      description="Data-driven career decision analytics, readiness scoring, trajectory forecasting, and real-time market alignment tailored to your evidence."
    >
      <div className="flex flex-col gap-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Career Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered career decision analytics tailored to your real progress and evidence.
          </p>
        </div>
        <CareerIntelligenceCard />
      </div>
    </FeatureLockedOverlay>
  );
}
