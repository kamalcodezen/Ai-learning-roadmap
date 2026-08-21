"use client";

import { motion } from "motion/react";
import TextBody from "./TextBody";

interface BannerHeaderProps {
  badge: string;
  heading: string;
  subHeading: string;
}

export default function BannerHeader({
  heading,
  subHeading,
}: BannerHeaderProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
      </motion.div>

      <div className="mt-7 w-full">
        <TextBody heading={heading} subHeading={subHeading} />
      </div>
    </>
  );
}