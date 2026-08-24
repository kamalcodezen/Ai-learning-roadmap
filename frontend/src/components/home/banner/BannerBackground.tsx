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
      <div className="absolute inset-0 -z-30 bg-background" />

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

          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/75" />
          
          {/* Top edge fade gradient */}
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-background to-transparent pointer-events-none" />

          <div className="absolute inset-0 backdrop-blur-[3px]" />
        </motion.div>
      </AnimatePresence>
    </>
  );
}