import type { Metadata } from "next";
import type { ReactNode } from "react";

import DashboardSidebar from "@/src/components/dashboard/shared/dashboardSidebar/DashboardSidebar";
import SessionGuard from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import DashboardScrollProvider from "@/src/components/dashboard/shared/DashboardScrollProvider";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard | AI Pather",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard>
      <div className="h-screen w-full overflow-hidden bg-[#eae0ff] lg:pt-[15px] lg:pb-[15px] lg:pr-[15px] dark:bg-[#5b3491]">
        <div className="flex h-full w-full overflow-hidden bg-background lg:rounded-2xl dark:bg-[#0b0f1a] transition-all duration-300">
          <DashboardSidebar />
          <DashboardScrollProvider>{children}</DashboardScrollProvider>
        </div>
      </div>
    </SessionGuard>
  );
}
