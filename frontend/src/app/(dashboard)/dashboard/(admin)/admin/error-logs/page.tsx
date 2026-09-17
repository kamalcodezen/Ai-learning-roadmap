import AdminErrorLogsView from "@/src/components/dashboard/admin/AdminErrorLogsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Logs",
};

export default function Page() {
  return <AdminErrorLogsView />;
}
