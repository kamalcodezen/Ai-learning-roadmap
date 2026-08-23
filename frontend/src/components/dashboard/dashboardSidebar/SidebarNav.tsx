"use client";

import { usePathname } from "next/navigation";

import { dashboardNavItems } from "../navigation";
import SidebarNavItem from "./SidebarNavItem";

interface SidebarNavProps {
  indicatorId: string;
  onItemClick?: () => void;
}

export default function SidebarNav({
  indicatorId,
  onItemClick,
}: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex-1 space-y-1.5 overflow-y-auto pl-4 py-2"
    >
      {dashboardNavItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          item={item}
          active={isActive(item.href)}
          indicatorId={indicatorId}
          onClick={onItemClick}
        />
      ))}
    </nav>
  );
}