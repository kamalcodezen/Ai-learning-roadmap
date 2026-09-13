import JobRealityContent from "@/src/components/dashboard/learner/job-reality/JobRealityContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Reality",
};

export default function JobRealityPage() {
  return <JobRealityContent />;
}
