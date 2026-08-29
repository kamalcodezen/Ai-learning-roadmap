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
            className="relative min-h-0 w-full flex-1 overflow-y-auto pl-4 sm:pl-8 md:pl-12 lg:pl-[272px]"
          >
            <div className="global-pos relative w-full -ml-5 lg:ml-0 pt-20 lg:pt-5 p-5 lg:pl-2">{children}</div>
          </section>
        </div>
      </div>
    </SessionGuard>
  );
}
