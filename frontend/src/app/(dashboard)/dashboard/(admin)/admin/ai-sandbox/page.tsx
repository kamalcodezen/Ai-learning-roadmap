import AdminAiSandboxView from "@/src/components/dashboard/admin/AdminAiSandboxView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt & Model Sandbox",
};

export default function Page() {
  return <AdminAiSandboxView />;
}
