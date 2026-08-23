import { ReactNode } from "react";
import { GoArrowUpRight } from "react-icons/go";

interface ButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "soft";
  className?: string;
}

export default function Button({
  text,
  href,
  onClick,
  icon,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const content = (
    <>
      {/* Expanding background */}
      <span
        className={`absolute right-1 top-1 h-10 w-10 rounded-full transition-all duration-500 ease-out group-hover:w-[calc(100%-8px)] ${
          variant === "primary"
            ? "bg-background group-hover:bg-primary"
            : "bg-muted group-hover:bg-primary"
        }`}
      />

      {/* Text */}
      <span
        className={`relative z-10 transition-all duration-500 ease-out group-hover:translate-x-8 ${
          variant === "primary"
            ? "group-hover:text-secondary"
            : "text-foreground group-hover:text-secondary"
        }`}
      >
        {text}
      </span>

      {/* Arrow */}
      <span
        className={`absolute right-1 top-1 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ease-out group-hover:right-[calc(100%-44px)] group-hover:rotate-45 ${
          variant === "primary"
            ? ""
            : "text-foreground group-hover:text-secondary"
        }`}
      >
        {icon ?? (
          <GoArrowUpRight
            className={`text-xl transition-colors duration-500 ${
              variant === "primary"
                ? "text-foreground group-hover:text-secondary"
                : ""
            }`}
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
    h-12
    items-center
    justify-between
    overflow-hidden
    rounded-full
    px-6
    pl-7
    pr-16
    text-base
    font-medium
    transition-colors
    duration-300
    ${
      variant === "primary"
        ? "bg-foreground text-background"
        : "border border-border bg-card-soft text-foreground shadow-sm"
    }
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