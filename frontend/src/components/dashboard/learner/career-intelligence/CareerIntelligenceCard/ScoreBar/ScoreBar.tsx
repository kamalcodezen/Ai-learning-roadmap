import { toneStyles, type Tone } from "../shared/tones";

export default function ScoreBar({
  label,
  score,
  tone = "purple",
  description,
}: {
  label: string;
  score: number;
  tone?: Tone;
  description?: string;
}) {
  const style = toneStyles[tone];

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>

          {description && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <span className={`text-sm font-black ${style.text}`}>
          {score}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${style.dot}`}
          style={{
            width: `${Math.max(0, Math.min(score, 100))}%`,
          }}
        />
      </div>
    </div>
  );
}