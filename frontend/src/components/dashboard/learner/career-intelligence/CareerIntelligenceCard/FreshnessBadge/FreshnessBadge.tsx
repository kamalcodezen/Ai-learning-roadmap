import type { EvidenceFreshness } from "@/src/lib/api/learner/career-intelligence";

import { getFreshnessMeta } from "../shared/meta";
import { toneStyles } from "../shared/tones";

export default function FreshnessBadge({
  freshness,
}: {
  freshness: EvidenceFreshness;
}) {
  const meta = getFreshnessMeta(freshness);
  const style = toneStyles[meta.tone];
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "text-[10px] font-semibold",
        style.text,
      ].join(" ")}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}