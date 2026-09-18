"use client";

import { AnimatePresence, motion } from "motion/react";

interface BannerBackgroundProps {
  image: string;
  title: string;
  video?: string;
}

export default function BannerBackground({
  image,
  title,
  video,
}: BannerBackgroundProps) {
  const showVideo = Boolean(video);

  return (
    <>
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
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: showVideo ? 1 : 0 }}
        transition={{ duration: 0.55 }}
        className="absolute inset-0 -z-10"
      >
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 to-[#f4edff31] dark:from-brand/25 dark:to-[#281c3d]" />
    </>
  );
}