"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface TextBodyProps {
  heading: string;
  subHeading: string;
}

/* Renders text with *word* segments highlighted in brand purple */
function renderHighlighted(text: string): ReactNode[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
        return (
          <span
            key={index}
            className="
              font-extrabold
              text-[#9F54F7]
              [text-shadow:0_3px_14px_rgba(0,0,0,0.65)]
            "
          >
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
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center pb-2 text-center sm:pb-14">

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
          mb-2
          flex
          items-center
          gap-2
          font-poppins
          text-xs
          font-semibold
          uppercase
          tracking-[0.18em]
          text-[#9F54F7]
          [text-shadow:0_3px_14px_rgba(0,0,0,0.65)]
          sm:mb-4
        "
      >
        <span className="text-sm">✦</span>
        Track Your Journey
      </motion.div>

      {/* Heading */}
      <motion.h1
        key={heading}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-label={plainHeading}
        className="
          text-3xl
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

      {/* Subtitle */}
      <motion.p
        key={`${heading}-subtitle`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          delay: 0.12,
          ease: "easeOut",
        }}
        className="
          section-description
          mt-2
          max-w-xl
          px-4
          font-poppins
          text-sm
          text-white/80
          [text-shadow:0_3px_14px_rgba(0,0,0,0.65)]
          sm:mt-5
          sm:text-lg
        "
      >
        {renderHighlighted(subHeading)}
      </motion.p>
    </div>
  );
}