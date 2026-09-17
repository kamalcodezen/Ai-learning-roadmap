import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Admin Profile",
  description: "Administrative profile, telemetry hub, and platform infrastructure overview.",
};

export default function AdminProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
