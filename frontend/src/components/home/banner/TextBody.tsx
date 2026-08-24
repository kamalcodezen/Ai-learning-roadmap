"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface TextBodyProps {
  heading: string;
  subHeading: string;
}

/* Renders text with *word* segments highlighted in brand primary color */
function renderHighlighted(text: string): ReactNode[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={index} className="text-primary">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
}

export default function TextBody({
  heading,
  subHeading,
}: TextBodyProps) {
  const plainHeading = heading.replace(/\*/g, "");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center pb-10 text-center sm:pb-14">
      <motion.h1
        key={heading}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-label={plainHeading}
        className="text-h1 sm:whitespace-nowrap sm:[text-wrap:unset]"
      >
        {renderHighlighted(heading)}
      </motion.h1>

      <motion.p
        key={`${heading}-subtitle`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        className="section-description mt-5 max-w-xl px-4 font-poppins text-sm sm:text-base"
      >
        {renderHighlighted(subHeading)}
      </motion.p>
    </div>
  );
}
