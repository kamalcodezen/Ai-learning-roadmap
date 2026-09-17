import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Readiness Profile",
  description: "View and customize your career target role, experience level, and study pace.",
};

export default function LearnerProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
