import type { ReactNode } from "react";

import { toneStyles, type Tone } from "../shared/tones";

export default function StatusPill({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const style = toneStyles[tone];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full border px-3 py-1",
        "text-[11px] font-bold",
        style.text,
        style.soft,
        style.border,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {children}
    </span>
  );
}