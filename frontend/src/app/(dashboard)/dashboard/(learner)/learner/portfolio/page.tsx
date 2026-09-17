import type { Metadata } from "next";
import { Suspense } from "react";
import PortfolioPage from "@/src/components/dashboard/learner/portfolio/PortfolioPage";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";

export const metadata: Metadata = {
  title: "Proof of Work & Portfolio",
  description: "Showcase verified capstone projects, code repos, and demonstrated technical capabilities.",
};

export default function Page() {
  return (
    <Suspense fallback={<GenericPageSkeleton />}>
      <PortfolioPage />
    </Suspense>
  );
}
