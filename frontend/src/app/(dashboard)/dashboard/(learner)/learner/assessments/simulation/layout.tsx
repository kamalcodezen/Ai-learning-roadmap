import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Mastery Simulation",
  description: "Interactive skill diagnostic and assessment simulation.",
};

export default function SimulationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
