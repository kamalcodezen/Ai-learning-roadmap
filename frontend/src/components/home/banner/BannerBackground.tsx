"use client";

import { AnimatePresence, motion } from "motion/react";

interface BannerBackgroundProps {
  image: string;
  title: string;
}

export default function BannerBackground({
  image,
  title,
}: BannerBackgroundProps) {
  return (
    <>
      {/* Base background */}
      <div className="absolute inset-0 -z-30 bg-[#faf8f2]" />

      {/* Dynamic centered-card background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0 -z-20"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />

          <div className="absolute inset-0 bg-linear-to-b from-white/55 to-white" />

          <div className="absolute inset-0 backdrop-blur-[3px]" />
        </motion.div>
      </AnimatePresence>
    </>
  );
}