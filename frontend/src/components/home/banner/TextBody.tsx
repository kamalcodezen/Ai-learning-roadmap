"use client";

import { motion } from "motion/react";

import FoldText from "./FoldText";

interface TextBodyProps {
  heading: string;
  subHeading: string;
}

export default function TextBody({
  heading,
  subHeading,
}: TextBodyProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      <FoldText
        key={heading}
        text={heading}
        splitBy="char"
        hinge="bottom"
        trigger="mount"
        duration={0.65}
        stagger={0.045}
        ease={[0.22, 1, 0.36, 1]}
        perspective={700}
        creaseShading={0.55}
        fontSize={48}
        fontWeight={800}
        color="#0a0a0a"
      />

      <motion.p
        key={`${heading}-subtitle`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        className="mt-5 max-w-xl px-4 font-serif text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7"
      >
        {subHeading}
      </motion.p>
    </div>
  );
}