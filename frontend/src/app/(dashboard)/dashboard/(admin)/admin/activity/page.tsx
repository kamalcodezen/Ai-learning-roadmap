import { Metadata } from "next";
import AdminActivityView from "@/src/components/dashboard/admin/AdminActivityView";

export const metadata: Metadata = {
  title: "System Activity",
};

export default function Page() {
  return <AdminActivityView />;
}
