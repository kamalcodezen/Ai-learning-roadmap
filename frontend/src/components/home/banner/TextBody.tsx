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
    <div className="mx-auto flex w-full max-w-full flex-col items-center text-center">
      {heading.split("\n").map((line, idx) => (
        <FoldText
          key={`${line}-${idx}`}
          text={line}
          splitBy="char"
          hinge="bottom"
          trigger="mount"
          duration={0.65}
          stagger={0.045}
          ease={[0.22, 1, 0.36, 1]}
          perspective={700}
          creaseShading={0}
          fontSize={68}
          fontWeight={800}
        />
      ))}

      <motion.p
        key={`${heading}-subtitle`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        className="mt-4 sm:mt-5 max-w-xl px-4 font-poppins text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-6 md:text-base md:leading-7"
      >
        {subHeading}
      </motion.p>
    </div>
  );
}