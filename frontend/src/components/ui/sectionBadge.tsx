import { FiTrendingUp } from "react-icons/fi";

interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <div className="font-poppins inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary px-3.5 py-1.5 sm:px-5 sm:py-2 text-small md:text-body font-medium text-secondary shadow-sm">
      <FiTrendingUp className="text-body" />
      <span>{text}</span>
    </div>
  );
}