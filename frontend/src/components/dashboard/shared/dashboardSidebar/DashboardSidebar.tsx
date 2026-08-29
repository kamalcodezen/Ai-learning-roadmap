"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";

import { authClient } from "@/src/lib/auth-client";
import { getBottomNavItems } from "../navigation";
import BottomNavBar from "../bottomNavBar/BottomNavBar";
import MobileSidebarToggle from "./MobileSidebarToggle";
import SidebarContent from "./SidebarContent";
import "./dashboardSidebar.css";

const drawerVariants: Variants = {
  open: {
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 250 },
  },
  closed: {
    x: "-100%",
    transition: { type: "spring", damping: 25, stiffness: 250 },
  },
};

export default function DashboardSidebar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userRole = (user as { role?: string })?.role || "learner";
  const prefix = userRole === "admin" ? "/dashboard/admin" : "/dashboard/learner";
  const bottomNavItems = getBottomNavItems(prefix);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerOpen]);

  const sidebarRef = useRef<HTMLElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    const nav = sidebarRef.current?.querySelector("nav");
    if (!nav) return;

    const { scrollTop, scrollHeight, clientHeight } = nav;
    const canScrollDown = scrollTop + clientHeight < scrollHeight;
    const canScrollUp = scrollTop > 0;

    if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
      e.preventDefault();
      nav.scrollTop += e.deltaY;
    }
  }, []);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <aside
        ref={sidebarRef}
        aria-label="Dashboard sidebar"
        className="sidebar-container sidebar-gradient fixed left-0 top-0 z-40 hidden h-screen w-64 text-foreground lg:flex"
      >
        <SidebarContent
          userName={user?.name}
          userEmail={user?.email}
          indicatorId="sidebar-nav-active-desktop"
        />
      </aside>

      <BottomNavBar items={bottomNavItems} />

      <MobileSidebarToggle onOpen={() => setDrawerOpen(true)} />

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              aria-hidden="true"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="sidebar-container sidebar-gradient absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-hidden text-foreground shadow-2xl"
            >
              <SidebarContent
                userName={user?.name}
                userEmail={user?.email}
                indicatorId="sidebar-nav-active-mobile"
                onClose={closeDrawer}
                onNavigate={closeDrawer}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
