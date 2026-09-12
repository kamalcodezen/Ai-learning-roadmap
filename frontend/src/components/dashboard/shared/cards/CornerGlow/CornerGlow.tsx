import { cn } from "@/src/utils/cn";

/**
 * Corner-glow shape placed inside a container that already has the `group` class.
 * Renders as an absolutely positioned static shape.
 */
export function CornerGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10",
        className,
      )}
      aria-hidden="true"
    />
  );
}
