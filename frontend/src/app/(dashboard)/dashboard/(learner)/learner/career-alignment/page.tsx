import type { Metadata } from "next";
import CareerAlignmentPage from "@/src/components/dashboard/learner/career-alignment/CareerAlignmentPage";

export const metadata: Metadata = {
  title: "Career Alignment",
  description: "Align your skillset and career aspirations with high-growth tech positions.",
};

export default function Page() {
  return <CareerAlignmentPage />;
}
