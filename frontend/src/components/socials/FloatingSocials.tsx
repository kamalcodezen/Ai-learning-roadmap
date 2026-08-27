"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, X } from "lucide-react";

export function FloatingSocials() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      copyLink();
    }
  };

  const iconClass =
    "w-11 h-11 rounded-full bg-black/40 border border-[var(--color-primary)]/30 flex items-center justify-center text-zinc-300 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:scale-110 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)] cursor-pointer";

  return (
    <div className="hidden md:flex fixed bottom-6 left-6 z-50 flex-col items-center gap-4 font-sans">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(159,84,247,0.5)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3 bg-gradient-to-b from-[#f3e8ff]/95 via-[#ede5ff]/95 to-[#ddd0ff]/95 dark:from-[#0a0015]/95 dark:via-[#120025]/95 dark:to-[#1a0040]/95 border border-[var(--color-primary)]/40 rounded-3xl py-4 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md"
          >
            {/* Direct Share Button */}
            <button
              onClick={handleShare}
              className={iconClass}
              aria-label="Share page"
              title="Share page"
            >
              <Share2 size={18} />
            </button>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className={iconClass}
              aria-label="Copy link"
              title="Copy link"
            >
              {copied ? (
                <Check size={18} className="text-[var(--color-primary)]" />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleOpen}
        aria-label="Toggle Menu"
        className="group relative flex items-center justify-center rounded-full w-14 h-14 text-white shadow-[0_0_20px_rgba(159,84,247,0.5)] cursor-pointer outline-none select-none z-50"
        style={{ background: "var(--gradient-primary)" }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <Share2 size={24} strokeWidth={2.5} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
