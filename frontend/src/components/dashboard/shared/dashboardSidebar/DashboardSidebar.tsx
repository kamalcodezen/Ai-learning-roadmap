"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";

import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getBottomNavItems } from "../navigation";
import BottomNavBar from "../bottomNavBar/BottomNavBar";
import MobileSidebarToggle from "./MobileSidebarToggle";
import SidebarContent from "./SidebarContent";
import SidebarHeader from "./SidebarHeader";
import ProfileCard from "./ProfileCard";
import SidebarNav from "./SidebarNav";
import SignOutButton from "./SignOutButton";
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
  const { data: session } = useDashboardSession();
  const user = session?.user;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userRole = (user as { role?: string })?.role || "LEARNER";
  const prefix = userRole.toUpperCase() === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";
  const bottomNavItems = getBottomNavItems(prefix);

  // Escape key closes drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerOpen]);

  // ── Desktop sidebar: mouse-wheel scroll handler ──────────────────
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

  // ── Mobile drawer: mouse-wheel scroll handler (same pattern) ─────
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const handleMobileWheel = useCallback((e: WheelEvent) => {
    const el = mobileNavRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScrollDown = scrollTop + clientHeight < scrollHeight;
    const canScrollUp = scrollTop > 0;
    if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    // Capture ref at effect time — used in both timeout and cleanup
    const navEl = mobileNavRef.current;
    const timer = setTimeout(() => {
      if (!navEl) return;
      navEl.addEventListener("wheel", handleMobileWheel, { passive: false });
    }, 50);
    return () => {
      clearTimeout(timer);
      navEl?.removeEventListener("wheel", handleMobileWheel);
    };
  }, [drawerOpen, handleMobileWheel]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
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

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              aria-hidden="true"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="sidebar-container sidebar-gradient absolute inset-y-0 left-0 flex h-screen w-72 max-w-[85vw] flex-col text-foreground shadow-2xl"
            >
              {/* Fixed header */}
              <SidebarHeader onClose={closeDrawer} />

              {/* Fixed profile card */}
              <div className="shrink-0 px-4 pt-2 pb-2">
                <ProfileCard name={user?.name} email={user?.email} />
              </div>

              {/* Scrollable navigation — independent scroll zone */}
              <div
                ref={mobileNavRef}
                className="mobile-nav-scroll flex-1 overflow-y-auto overscroll-contain"
                style={{ touchAction: "pan-y" }}
              >
                <SidebarNav
                  indicatorId="sidebar-nav-active-mobile"
                  onItemClick={closeDrawer}
                />
              </div>

              {/* Fixed footer */}
              <SignOutButton onSignOut={closeDrawer} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
