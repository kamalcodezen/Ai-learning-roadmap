import AdminRoadmapsView from "@/src/components/dashboard/admin/AdminRoadmapsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmaps",
};

export default function AdminRoadmapsPage() {
  return <AdminRoadmapsView />;
}
