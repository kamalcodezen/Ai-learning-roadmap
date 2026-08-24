"use client";

import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { TypographyH1 } from "@/src/components/shadcn-studio/typography/typography-01";

interface FoldTextProps {
  text: string;
  splitBy?: "char" | "word";
  hinge?: "bottom" | "top";
  trigger?: "mount" | "hover";
  duration?: number;
  stagger?: number;
  ease?: Easing;
  perspective?: number;
  creaseShading?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
}

const FOLD_EASE: Easing = [0.22, 1, 0.36, 1];

export default function FoldText({
  text,
  splitBy = "char",
  hinge = "bottom",
  trigger = "mount",
  duration = 0.65,
  stagger = 0.045,
  ease = FOLD_EASE,
  perspective = 700,
  creaseShading = 0.55,
  fontWeight = 800,
  color = "var(--color-heading-1)",
}: FoldTextProps) {
  const units =
    splitBy === "word" ? text.split(" ") : Array.from(text);

  const characters =
    splitBy === "word"
      ? units.map((unit, index) => ({
          content: index < units.length - 1 ? `${unit} ` : unit,
        }))
      : units.map((character) => ({ content: character }));

  return (
    <TypographyH1
      style={{
        perspective: `${perspective}px`,
        color,
        fontWeight,
      }}
      aria-label={text}
    >
      {characters.map(({ content }, index) => {
        const isSpace = content === " " || content === "\u00A0";

        return (
          <motion.span
            key={`${content}-${index}`}
            initial={
              trigger === "mount"
                ? { opacity: 0, rotateX: -75, y: 18 }
                : false
            }
            animate={
              trigger === "hover" ? {} : { opacity: 1, rotateX: 0, y: 0 }
            }
            whileHover={
              trigger === "hover" ? { rotateX: 0, y: 0 } : undefined
            }
            transition={{ duration, delay: index * stagger, ease }}
            className="relative inline-block"
            style={{
              display: "inline-block",
              transformOrigin:
                hinge === "bottom" ? "bottom center" : "top center",
              transformStyle: "preserve-3d",
              whiteSpace: isSpace ? "pre" : undefined,
            }}
          >
            {isSpace ? "\u00A0" : content}

            {creaseShading > 0 && (
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))",
                  opacity: creaseShading,
                }}
                aria-hidden="true"
              />
            )}
          </motion.span>
        );
      })}
    </TypographyH1>
  );
}