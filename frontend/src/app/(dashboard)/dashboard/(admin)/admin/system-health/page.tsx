import AdminSystemHealthView from "@/src/components/dashboard/admin/AdminSystemHealthView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Health",
};

export default function Page() {
  return <AdminSystemHealthView />;
}
