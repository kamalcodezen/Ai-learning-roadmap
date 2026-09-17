import AdminBroadcastsView from "@/src/components/dashboard/admin/AdminBroadcastsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broadcast & Notifications",
};

export default function Page() {
  return <AdminBroadcastsView />;
}
