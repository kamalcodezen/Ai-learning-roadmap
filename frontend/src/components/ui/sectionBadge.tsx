interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-brand">
      <span
        className="size-1.5 rounded-full bg-brand"
        aria-hidden="true"
      />

      <span>{text}</span>
    </div>
  );
}