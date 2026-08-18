import { ReactNode } from "react";
import { GoArrowUpRight } from "react-icons/go";

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
      {/* Expanding background */}
      <span
        className="absolute right-1 top-1 h-10 w-10 rounded-full bg-background transition-all duration-500 ease-out group-hover:w-[calc(100%-8px)] group-hover:bg-primary"
      />

      {/* Text */}
      <span className="relative z-10 transition-all duration-500 ease-out group-hover:translate-x-8 group-hover:text-secondary">
        {text}
      </span>

      {/* Arrow */}
      <span
        className="absolute right-1 top-1 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ease-out group-hover:right-[calc(100%-44px)] group-hover:rotate-45"
      >
        {icon ?? (
          <GoArrowUpRight className="text-foreground transition-colors duration-500 group-hover:text-secondary text-xl" />
        )}
      </span>
    </>
  );

  const classes = `
    font-sans
    group
    relative
    flex
    h-12
    items-center
    justify-between
    overflow-hidden
    rounded-full
    bg-foreground
    px-6
    pl-7
    pr-16
    text-base
    font-medium
    text-background
    transition-colors
    duration-300
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