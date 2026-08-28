import type { Metadata } from "next";
import type { ReactNode } from "react";

import DashboardSidebar from "@/src/components/dashboard/dashboardSidebar/DashboardSidebar";
import SessionGuard from "@/src/components/dashboard/sessionGuard/SessionGuard";

export const metadata: Metadata = {
  title: "Dashboard | AI Pather",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard>
      <div className="h-screen w-full overflow-hidden bg-[#eae0ff] lg:pt-[15px] lg:pb-[15px] lg:pr-[15px] dark:bg-[#5b3491]">
        <div className="flex h-full w-full overflow-hidden bg-background lg:rounded-2xl dark:bg-[#0b0f1a]">
          <DashboardSidebar />
          <section
            aria-label="Dashboard content"
            data-lenis-prevent-wheel
            className="relative min-h-0 w-full flex-1 overflow-y-auto px-4 pt-20 pb-28 sm:px-8 md:px-12 lg:pb-10 lg:pl-[272px] lg:pr-8 lg:pt-10"
          >
            <div className="global-pos relative w-full">{children}</div>
          </section>
        </div>
      </div>
    </SessionGuard>
  );
}
