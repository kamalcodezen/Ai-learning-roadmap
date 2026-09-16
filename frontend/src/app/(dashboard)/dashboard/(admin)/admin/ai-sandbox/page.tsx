import AdminAiSandboxView from "@/src/components/dashboard/admin/AdminAiSandboxView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt & Model Sandbox | Admin Console",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            AI Prompt &amp; Model <span className="text-brand">Sandbox</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Test LLM prompts, model configurations, and reasoning token telemetry in real-time.
          </p>
        </div>
      </div>
      <AdminAiSandboxView />
    </div>
  );
}
