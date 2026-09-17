import { Metadata } from "next";
import AdminJobRealityView from "@/src/components/dashboard/admin/AdminJobRealityView";

export const metadata: Metadata = {
  title: "Job Reality",
};

export default function Page() {
  return <AdminJobRealityView />;
}
