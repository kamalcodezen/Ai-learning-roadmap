"use client";

import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

export function AnimatedThemeTogglerDemo() {
  return (
    <div className="flex justify-center p-6 bg-background rounded-lg border border-border">
      <AnimatedThemeToggler />
    </div>
  );
}
