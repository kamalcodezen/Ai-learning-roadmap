"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiX } from "react-icons/fi";
import { FeatureItem } from "./types";

interface FeatureTooltipModalProps {
  feature: FeatureItem | null;
  position: "left" | "right";
  onClose?: () => void;
}

export default function FeatureTooltipModal({
  feature,
  position,
  onClose,
}: FeatureTooltipModalProps) {
  // Dismiss modal on Escape key press (for tablet keyboard accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {feature && (
        <>
          {/* ========================================================= */}
          {/* DESKTOP HOVER TOOLTIP (lg screens and up)                  */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: position === "right" ? 12 : -12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position === "right" ? 12 : -12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`hidden lg:block absolute top-0 z-30 w-80 xl:w-96 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl pointer-events-none ${
              position === "right" ? "left-full ml-4" : "right-full mr-4"
            }`}
          >
            {/* Arrow Pointer */}
            <div
              className={`absolute top-8 w-3 h-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transform rotate-45 ${
                position === "right"
                  ? "-left-[7px] border-l border-b"
                  : "-right-[7px] border-r border-t"
              }`}
            />

            {/* Header */}
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {feature.title}
            </h4>

            {/* Bullet Points */}
            <ul className="mt-4 space-y-3">
              {feature.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <FiCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ========================================================= */}
          {/* MOBILE & TABLET MODAL OVERLAY (< lg screens)              */}
          {/* ========================================================= */}
          <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Dark Backdrop (Clicking backdrop closes modal) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10"
            >
              {/* Active Close Button (FiX icon) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors focus:outline-none"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Title */}
              <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight pr-8">
                {feature.title}
              </h4>

              {/* Bullet List */}
              <ul className="mt-4 space-y-3">
                {feature.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <FiCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}