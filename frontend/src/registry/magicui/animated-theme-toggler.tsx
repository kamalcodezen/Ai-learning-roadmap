"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiSun, FiMoon } from "react-icons/fi";

export function AnimatedThemeToggler() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-10.5 h-10.5 rounded-full border border-border bg-card hover:bg-muted/50 text-foreground transition-all duration-300 focus:outline-none shadow-sm ml-2 md:ml-3"
      aria-label="Toggle Theme"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -20, opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: 20, opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 250, damping: 20 }}
          className="absolute flex items-center justify-center"
        >
          {isDark ? (
            <FiSun className="w-4.5 h-4.5" />
          ) : (
            <FiMoon className="w-4.5 h-4.5" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
