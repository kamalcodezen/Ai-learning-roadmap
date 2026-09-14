import { Suspense } from "react";
import PortfolioPage from "@/src/components/dashboard/learner/portfolio/PortfolioPage";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<GenericPageSkeleton />}>
      <PortfolioPage />
    </Suspense>
  );
}
