import { toneStyles } from "../shared/tones";
import type { SignalProps } from "../shared/types";

export default function MetricSignal({
  label,
  value,
  description,
  icon,
  tone = "purple",
}: SignalProps) {
  const style = toneStyles[tone];

  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border p-4",
        style.border,
        style.soft,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex items-center gap-1.5 text-[11px] font-semibold",
            style.text,
          ].join(" ")}
        >
          {icon}
          {label}
        </div>
      </div>

      <div className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {value}
      </div>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}