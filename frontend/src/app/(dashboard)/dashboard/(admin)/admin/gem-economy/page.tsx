import { Metadata } from "next";
import AdminGemEconomyView from "@/src/components/dashboard/admin/AdminGemEconomyView/AdminGemEconomyView";

export const metadata: Metadata = {
  title: "Gem Economy & Streaks Manager | Admin",
  description: "Platform-wide AI Gem economy treasury, daily streak monitoring, and learner drop-off recovery.",
};

export default function GemEconomyAdminPage() {
  return <AdminGemEconomyView />;
}
