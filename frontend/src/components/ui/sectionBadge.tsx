import { FiTrendingUp } from "react-icons/fi";

interface SectionBadgeProps {
  text: string;
}

export default function SectionBadge({ text }: SectionBadgeProps) {
  return (
    <div className="font-poppins inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#ceff1f] px-3.5 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-[13px] md:text-[15px] font-medium text-[#131824] shadow-sm">
      <FiTrendingUp className="text-[14px] sm:text-[17px]" />
      <span>{text}</span>
    </div>
  );
}