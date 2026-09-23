"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { authClient } from "@/src/lib/auth-client";
import SidebarContent from "../shared/dashboardSidebar/SidebarContent";
import MobileSidebarToggle from "../shared/dashboardSidebar/MobileSidebarToggle";
import BottomNavBar from "../shared/bottomNavBar/BottomNavBar";
import "../shared/dashboardSidebar/dashboardSidebar.css";
import { getBottomNavItems } from "../shared/navigation";

const drawerVariants: Variants = {
  open: { x: 0, transition: { type: "spring", damping: 25, stiffness: 250 } },
  closed: { x: "-100%", transition: { type: "spring", damping: 25, stiffness: 250 } },
};

export default function AdminSidebar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Admin always uses the admin prefix
  const bottomNavItems = getBottomNavItems("/dashboard/admin");

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
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

  // ── Auto-close drawer on route change or global event ────────────
  useEffect(() => {
    const handleClose = () => {
      setDrawerOpen(false);
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
    window.addEventListener("route-change-close-drawers", handleClose);
    return () => window.removeEventListener("route-change-close-drawers", handleClose);
  }, []);

  // ── Lock body scroll ONLY while mobile drawer is open ────────────
  useEffect(() => {
    if (!drawerOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        aria-label="Admin Dashboard sidebar"
        className="sidebar-container sidebar-gradient fixed left-0 top-0 z-40 hidden h-screen w-64 text-foreground lg:flex"
      >
        <SidebarContent
          userName={user?.name}
          userEmail={user?.email}
          indicatorId="admin-sidebar-nav-active-desktop"
        />
      </aside>

      <BottomNavBar items={bottomNavItems} />

      <MobileSidebarToggle onOpen={() => setDrawerOpen(true)} />

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="admin-mobile-drawer-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop: 1-click anywhere outside closes drawer */}
            <div
              onClick={closeDrawer}
              aria-hidden="true"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin Dashboard menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              className="sidebar-container sidebar-gradient absolute inset-y-0 left-0 flex h-full max-h-[100dvh] w-72 max-w-[85vw] flex-col overflow-hidden overscroll-contain text-foreground shadow-2xl"
            >
              <SidebarContent
                userName={user?.name}
                userEmail={user?.email}
                indicatorId="admin-sidebar-nav-active-mobile"
                onClose={closeDrawer}
                onNavigate={closeDrawer}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
