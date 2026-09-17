import { Metadata } from "next";
import AdminProjectsView from "@/src/components/dashboard/admin/AdminProjectsView";

export const metadata: Metadata = {
  title: "Projects Overview",
};

export default function Page() {
  return <AdminProjectsView />;
}
