import type { ReadinessDimension } from "../shared/types";

export default function ReadinessMetric({
  dimension,
}: {
  dimension: ReadinessDimension;
}) {
  const isAssessed = dimension.score !== null;

  return (
    <div
      className={[
        "min-w-0 rounded-xl border p-3",
        dimension.highlighted
          ? "border-primary/30 bg-primary/[0.06]"
          : "border-border bg-card",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        {dimension.icon}
        <span className="truncate">{dimension.label}</span>
      </div>

      <div
        className={[
          "mt-2 text-lg font-black tracking-tight",
          dimension.highlighted
            ? "text-primary"
            : isAssessed
              ? "text-foreground"
              : "text-muted-foreground",
        ].join(" ")}
      >
        {dimension.value}
      </div>

      {isAssessed && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={[
              "h-full rounded-full",
              dimension.highlighted ? "bg-primary" : "bg-foreground/30",
            ].join(" ")}
            style={{
              width: `${Math.max(
                0,
                Math.min(dimension.score ?? 0, 100),
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}