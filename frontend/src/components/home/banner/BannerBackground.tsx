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

        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-[#f4edfff3] dark:from-brand/25 dark:to-[#281c3d]" />
      </motion.div>
    </AnimatePresence>
  );
}