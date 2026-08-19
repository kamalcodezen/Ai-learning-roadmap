import { ReactNode } from "react";
import { GoArrowUpRight } from "react-icons/go";

interface AnimatedButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  isActive?: boolean;
}

/**
 * Animated pill button with expanding background and rotating arrow.
 * Supports both <a> (when href provided) and <button> modes.
 */
export default function AnimatedButton({
  text,
  href,
  onClick,
  icon,
  className = "",
  isActive = false,
}: AnimatedButtonProps) {
  const content = (
    <>
      {/* Expanding background - slim height */}
      <span
        className={`
          absolute right-1 top-1 h-7 rounded-full transition-all duration-500 ease-out
          ${
            isActive
              ? "w-[calc(100%-8px)] bg-primary"
              : "w-7 bg-background group-hover:w-[calc(100%-8px)] group-hover:bg-primary"
          }
        `}
      />

      {/* Text - smaller font & slim padding */}
      <span
        className={`
          relative z-10 text-[13px] tracking-wider transition-all duration-500 ease-out
          ${
            isActive
              ? "translate-x-6 font-bold text-secondary"
              : "group-hover:translate-x-6 group-hover:text-secondary"
          }
        `}
      >
        {text}
      </span>

      {/* Arrow - compact circle */}
      <span
        className={`
          absolute top-1 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 ease-out
          ${
            isActive
              ? "right-[calc(100%-32px)] rotate-45"
              : "right-1 group-hover:right-[calc(100%-32px)] group-hover:rotate-45"
          }
        `}
      >
        {icon ?? (
          <GoArrowUpRight
            className={`
              text-base transition-colors duration-500
              ${
                isActive
                  ? "text-secondary"
                  : "text-foreground group-hover:text-secondary"
              }
            `}
          />
        )}
      </span>
    </>
  );

  const classes = `
    font-sans
    group
    relative
    flex
    h-9
    items-center
    justify-between
    overflow-hidden
    rounded-full
    bg-foreground
    px-4
    pl-5
    pr-11
    text-sm
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
