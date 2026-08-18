"use client";

import { motion } from "motion/react";
import type { Easing } from "motion/react";

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
  fontSize = 80,
  fontWeight = 800,
  color = "currentColor",
}: FoldTextProps) {
  const segments = text.split(/([ \n])/);
  let globalIndex = 0;

  return (
    <h1
      className="font-sans"
      style={{
        perspective: `${perspective}px`,
        fontSize: `clamp(2rem, 5vw, ${fontSize}px)`,
        fontWeight,
        color,
        lineHeight: 1,
      }}
      aria-label={text}
    >
      {segments.map((segment, segmentIndex) => {
        if (segment === "\n") {
          return <br key={`br-${segmentIndex}`} />;
        }
        if (segment === "") {
          return null;
        }

        const renderUnit = (content: string, index: number) => {
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

              {creaseShading > 0 && !isSpace && (
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
        };

        if (splitBy === "word") {
          const currentIndex = globalIndex++;
          return renderUnit(segment, currentIndex);
        } else {
          const chars = Array.from(segment);
          const isSpaceSegment = segment === " ";

          if (isSpaceSegment) {
            const currentIndex = globalIndex++;
            return renderUnit(segment, currentIndex);
          }

          return (
            <span
              key={`seg-${segmentIndex}`}
              className="inline-block whitespace-nowrap"
            >
              {chars.map((char) => {
                const currentIndex = globalIndex++;
                return renderUnit(char, currentIndex);
              })}
            </span>
          );
        }
      })}
    </h1>
  );
}