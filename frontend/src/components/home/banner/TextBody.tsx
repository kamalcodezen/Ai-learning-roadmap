"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface TextBodyProps {
  badge?: string;
  heading: string;
}

/* Renders text with *word* segments highlighted in brand purple */
export function renderHighlighted(text: string, isLightModeDark = false): ReactNode[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
        return (
          <span
            key={index}
            className={
              isLightModeDark
                ? "text-black dark:text-white font-semibold"
                : "text-white [text-shadow:0_3px_14px_rgba(0,0,0,0.65)]"
            }
          >
            {part.slice(1, -1)}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
}

export default function TextBody({ heading }: TextBodyProps) {
  const plainHeading = heading.replace(/\*/g, "");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center pb-2 text-center">
      {/* Eyebrow / Small Heading above main big heading */}
    

      {/* Heading */}
      <motion.h1
        key={heading}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-label={plainHeading}
        className="
        pt-12
          text-[2.5rem]
          font-extrabold
          text-white
          [text-shadow:0_3px_14px_rgba(0,0,0,0.65)]
          sm:text-h1
          sm:whitespace-nowrap
          sm:[text-wrap:unset]
        "
      >
        {renderHighlighted(heading)}
      </motion.h1>
    </div>
  );
}
