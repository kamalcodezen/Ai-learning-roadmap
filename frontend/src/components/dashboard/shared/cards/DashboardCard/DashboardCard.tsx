import { ReactNode } from "react";
import { cn } from "@/src/utils/cn";
import { plainCardClass } from "../CardClass";

/**
 * Plain big/content card — no hover border beam, hover glow, or corner shape.
 * This is the default shell for large content sections on dashboard pages.
 */
export function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(plainCardClass, className)}>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
