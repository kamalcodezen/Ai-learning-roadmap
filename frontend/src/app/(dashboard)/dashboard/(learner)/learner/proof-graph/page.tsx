import ProofGraphPage from "@/src/components/dashboard/learner/proof-graph/ProofGraphPage";
import FeatureLockedOverlay from "@/src/components/dashboard/shared/FeatureLockedOverlay";

export const metadata = {
  title: "Proof Graph & Skill Passport",
};

export default function Page() {
  return (
    <FeatureLockedOverlay
      featureName="Proof Graph & Skill Passport"
      requiredPlan="PRO"
      description="Showcase cryptographically verified skill evidence, interactive mastery trees, and shareable tamper-proof developer credentials."
    >
      <ProofGraphPage />
    </FeatureLockedOverlay>
  );
}
