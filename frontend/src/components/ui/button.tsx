import { ReactNode } from "react";
import { FaArrowRight } from "react-icons/fa";

interface ButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}

export default function Button({
  text,
  href,
  onClick,
  icon,
  className = "",
}: ButtonProps) {
  const content = (
    <>
      <span className="relative z-10">{text}</span>

      <span
        className="absolute right-1 top-1 flex h-10 w-10 items-center justify-end pr-3 rounded-full transition-all duration-500 ease-out group-hover:w-[calc(100%-8px)]"
        style={{ backgroundColor: "#C6F56E" }}
      >
        {icon ?? (
          <FaArrowRight />
        )}
      </span>
    </>
  );

  const classes = `
    group
    relative
    flex
    h-12
    items-center
    justify-start
    overflow-hidden
    rounded-full
    bg-neutral-800
    px-5
    pl-6
    pr-14
    text-sm
    font-medium
    text-white
    transition-colors
    duration-300
    hover:text-neutral-950
    ${className}
  `;

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}