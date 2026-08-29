"use client";

import { Menu } from "lucide-react";

interface MobileSidebarToggleProps {
  onOpen: () => void;
}

export default function MobileSidebarToggle({ onOpen }: MobileSidebarToggleProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/50 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open dashboard menu"
        aria-haspopup="dialog"
        className="flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
