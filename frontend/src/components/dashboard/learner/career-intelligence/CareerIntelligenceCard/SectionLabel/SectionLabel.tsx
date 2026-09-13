import type { ReactNode } from "react";

export default function SectionLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span>{children}</span>
    </div>
  );
}