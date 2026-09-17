import { Metadata } from "next";
import AdminAiUsageView from "@/src/components/dashboard/admin/AdminAiUsageView";

export const metadata: Metadata = {
  title: "AI Usage",
};

export default function Page() {
  return <AdminAiUsageView />;
}
