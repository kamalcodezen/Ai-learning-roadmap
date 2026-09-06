import { cn } from "@/src/utils/cn";

/**
 * Corner-hover glow shape placed inside a container that already has the `group` class.
 * Renders as an absolutely positioned shape that fades in on hover.
 */
export function CornerGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10",
        className,
      )}
      aria-hidden="true"
    />
  );
}
