import type { Metadata } from "next";
import CareerTwinPage from "@/src/components/dashboard/learner/career-twin/CareerTwinPage";

export const metadata: Metadata = {
  title: "Career Twin & Simulation",
  description: "Simulate career trajectory, compensation outcomes, and learning impact with AI.",
};

export default function Page() {
  return <CareerTwinPage />;
}
