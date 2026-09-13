import { ReactNode } from "react";
import { cn } from "@/src/utils/cn";
import { Card } from "@/src/components/ui/Card";
import { glowCardClass } from "../CardClass";
import { CornerGlow } from "../CornerGlow/CornerGlow";

/**
 * KPI / compact card — carries the hover glow + corner-hover treatment.
 * Backed by the base `Card` primitive with the `mouseGlow` radial hover glow.
 */
export function KpiCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card mouseGlow className={cn(glowCardClass, className)}>
      <CornerGlow />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </Card>
  );
}
