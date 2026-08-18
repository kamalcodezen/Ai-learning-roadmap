interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand px-3 py-1.5 text-xs font-medium text-black">
      <span
        className="size-1.5 rounded-full bg-black"
        aria-hidden="true"
      />

      <span>{text}</span>
    </div>
  );
}