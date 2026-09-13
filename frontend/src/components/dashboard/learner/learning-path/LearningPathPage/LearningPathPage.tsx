import { Suspense } from "react";
import LearningPathContent from "../LearningPathContent";
import LearningPathSkeleton from "../LearningPathSkeleton";

export default function LearningPathPage() {
  return (
    <Suspense fallback={<LearningPathSkeleton />}>
      <LearningPathContent />
    </Suspense>
  );
}
