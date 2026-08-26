import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";

import DashboardSidebar from "@/src/components/dashboard/dashboardSidebar/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard | AI Pather",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full bg-background dark:bg-background">
      <DashboardSidebar />
      <section
        aria-label="Dashboard content"
        className="relative w-full min-w-0 flex-1 overflow-hidden px-4 pt-20 pb-28 sm:px-8 md:px-12 lg:pb-10 lg:pl-[272px] lg:pr-8 lg:pt-10"
      >
        <div className="global-pos relative w-full">{children}</div>
      </section>
    </div>
  );
}
