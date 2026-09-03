import { Metadata } from "next";
import AdminAiUsageView from "@/src/components/dashboard/admin/AdminAiUsageView";

export const metadata: Metadata = {
  title: "AI Usage | Admin | AI Patter",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            AI <span className="text-brand">Usage</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Monitor AI call volume, success rates, and provider breakdowns.
          </p>
        </div>
      </div>
      <AdminAiUsageView />
    </div>
  );
}
