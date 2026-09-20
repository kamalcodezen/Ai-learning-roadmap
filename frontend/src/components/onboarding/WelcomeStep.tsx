"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Compass, Sparkles, Trophy } from "lucide-react";

const highlights = [
  {
    icon: Compass,
    title: "Guided path",
    text: "A roadmap shaped around your exact goal.",
  },
  {
    icon: Sparkles,
    title: "Skill proof",
    text: "Verified evidence you can show employers.",
  },
  {
    icon: Trophy,
    title: "Adaptive pacing",
    text: "Recovery plans that keep you on track.",
  },
];

export function WelcomeStep() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-8 py-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Image
          src="/brand/AI-Pather-blue.png"
          alt="AI Pather"
          height={40}
          width={220}
          className="h-10 sm:h-12 w-auto block dark:hidden object-contain"
        />
        <Image
          src="/brand/AI-Pather-white.png"
          alt="AI Pather"
          height={40}
          width={220}
          className="h-10 sm:h-12 w-auto hidden dark:block object-contain"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="space-y-4"
      >
        <h1 className="font-poppins text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Let&apos;s build your path.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          AI Pather learns where you are and where you want to go, then shapes a
          personalized learning experience around you — from first concept to
          verified career proof.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="grid w-full gap-3 sm:grid-cols-3"
      >
        {highlights.map((item) => (
          <div
            key={item.title}
            className="soft-card flex flex-col items-start gap-2 p-4 text-left"
          >
            <item.icon className="h-4 w-4 text-primary" />
            <p className="font-poppins text-sm font-semibold text-foreground">
              {item.title}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}