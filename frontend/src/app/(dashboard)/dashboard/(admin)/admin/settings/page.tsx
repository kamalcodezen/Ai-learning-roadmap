import type { Metadata } from "next";
import SettingsPage from "@/src/components/dashboard/shared/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Platform administrator preferences, system controls, and security settings.",
};

export default function Page() {
  return <SettingsPage />;
}
