import type { Metadata } from "next";
import AdminAnalyticsView from "@/src/components/dashboard/admin/AdminAnalyticsView";

export const metadata: Metadata = {
  title: "Platform Analytics",
  description: "Track platform-wide activity, growth, user distribution, and engagement metrics.",
};

export default function Page() {
  return <AdminAnalyticsView />;
}
