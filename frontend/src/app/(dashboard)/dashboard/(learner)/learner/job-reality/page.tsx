import JobRealityContent from "@/src/components/dashboard/learner/job-reality/JobRealityContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Reality | AI Learning Roadmap",
  description: "View real-time market expectations for your target role",
};

export default function JobRealityPage() {
  return <JobRealityContent />;
}
