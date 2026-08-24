"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, X } from "lucide-react";

export function FloatingSocials() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  // লিংক কপি করার ফাংশন
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // নেটিভ শেয়ার ফাংশন (মোবাইল বা সাপোর্টেড ডিভাইসে শেয়ার শিট ওপেন করবে)
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
      copyLink(); // যদি শেয়ার এপিআই সাপোর্ট না করে তবে কপি হবে
    }
  };

  const iconClass =
    "w-11 h-11 rounded-full bg-black/40 border border-[#CEFF1F]/30 flex items-center justify-center text-zinc-300 hover:text-[#CEFF1F] hover:border-[#CEFF1F] hover:scale-110 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.3)] cursor-pointer";

  return (
    <div className="hidden md:flex fixed bottom-6 left-6 z-50 flex-col items-center gap-4 font-sans">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#CEFF1F] text-[#131824] text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(206,255,31,0.5)]"
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
            className="flex flex-col items-center gap-3 bg-gradient-to-b from-[#e8f5b8]/95 via-[#ddf09e]/95 to-[#cbe87a]/95 dark:from-[#0f2a02]/95 dark:via-[#1a3a05]/95 dark:to-[#304c0a]/95 border border-[#CEFF1F]/40 rounded-3xl py-4 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md"
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
                <Check size={18} className="text-[#CEFF1F]" />
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
        className="group relative flex items-center justify-center rounded-full w-14 h-14 bg-[#CEFF1F] text-[#131824] shadow-[0_0_20px_rgba(206,255,31,0.5)] cursor-pointer outline-none select-none z-50"
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
