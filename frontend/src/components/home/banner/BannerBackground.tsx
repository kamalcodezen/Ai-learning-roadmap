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

      {/* Bottom ambient gradient: anchored at bottom edge, softly dissipating upwards */}
      <div
        className="banner-bottom-gradient pointer-events-none absolute inset-x-0 bottom-0 h-52 sm:h-64 md:h-80 z-0"
        aria-hidden="true"
      />
    </>
  );
}