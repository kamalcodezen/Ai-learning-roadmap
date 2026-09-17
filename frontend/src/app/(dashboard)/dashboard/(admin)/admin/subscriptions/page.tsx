import type { Metadata } from "next";
import AdminSubscriptionsView from "@/src/components/dashboard/admin/AdminSubscriptionsView/AdminSubscriptionsView";

export const metadata: Metadata = {
  title: "Subscriptions & Pricing",
  description: "Manage platform revenue, subscriber tiers, pricing models, and user quotas.",
};

export default function Page() {
  return <AdminSubscriptionsView />;
}
