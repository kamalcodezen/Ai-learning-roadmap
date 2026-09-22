import { cn } from "@/src/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/90 dark:bg-muted/90", className)}
      {...props}
    />
  );
}

export { Skeleton };
