"use client";

import { FC } from "react";
import { motion } from "framer-motion";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[var(--color-primary)]/40 bg-purple-50/90 dark:bg-[#120025]/95 px-4 py-3 backdrop-blur-md shadow-[0_0_15px_rgba(159,84,247,0.25)]",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] dark:bg-[var(--color-primary)]"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};
