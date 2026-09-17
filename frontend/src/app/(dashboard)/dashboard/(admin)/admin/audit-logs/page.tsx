import AuditLogsView from "@/src/components/dashboard/admin/AuditLogsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default function Page() {
  return <AuditLogsView />;
}
