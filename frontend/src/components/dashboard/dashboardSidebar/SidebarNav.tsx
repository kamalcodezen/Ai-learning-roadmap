"use client";

import { usePathname } from "next/navigation";

import { dashboardNavSections } from "../navigation";
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
      className="flex-1 space-y-6 overflow-y-auto pl-4 py-2 pb-6"
    >
      {dashboardNavSections.map((section, idx) => (
        <div key={idx} className="space-y-1.5">
          <h4 className="px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
            {section.title}
          </h4>
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.href + item.label}
              item={item}
              active={isActive(item.href)}
              indicatorId={`${indicatorId}-${item.href}`}
              onClick={onItemClick}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}