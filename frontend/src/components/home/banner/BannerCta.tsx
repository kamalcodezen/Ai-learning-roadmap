"use client";

import { motion } from "motion/react";

import Button from "../../ui/button";

interface BannerCtaProps {
  text: string;
  href: string;
}

export default function BannerCta({ text, href }: BannerCtaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      className="mt-15 sm:mt-15 md:mt-8 lg:mt-3 lg:mb-25"
    >
      <Button text={text} href={href} />
    </motion.div>
  );
}