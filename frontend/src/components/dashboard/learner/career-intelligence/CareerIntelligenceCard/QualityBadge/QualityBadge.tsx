import type { EvidenceQuality } from "@/src/lib/api/learner/career-intelligence";

import { getQualityMeta } from "../shared/meta";
import { toneStyles } from "../shared/tones";

export default function QualityBadge({
  quality,
}: {
  quality: EvidenceQuality;
}) {
  const meta = getQualityMeta(quality);
  const style = toneStyles[meta.tone];

  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5",
        "text-[9px] font-bold uppercase tracking-wide",
        style.text,
        style.soft,
        style.border,
      ].join(" ")}
    >
      {meta.label}
    </span>
  );
}