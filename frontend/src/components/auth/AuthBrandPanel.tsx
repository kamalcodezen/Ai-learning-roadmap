"use client";

import Image from "next/image";
import AuthSwitchButton from "./AuthSwitchButton";
import { TypingAnimation } from "@/src/registry/magicui/typing-animation";
import type { AuthBrandPanelProps } from "./auth.types";

export default function AuthBrandPanel({
  mode,
  logo,
  cubeSrc,
  onSwitch,
}: AuthBrandPanelProps) {
  const isSignUp = mode === "signup";

  return (
    <section
      className={[
        "relative z-20",
        "w-full",
        "md:absolute md:h-full md:w-[50%]",
        isSignUp ? "md:left-0 md:top-0" : "md:left-[50%] md:top-0",
        "bg-linear-to-b from-[#9F54F7] to-[#a054f792]",
        "transition-[left,top,width,height] duration-700 ease-linear",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex h-full w-full flex-col items-center text-center px-7 py-6 sm:px-10 sm:py-8 md:px-10 md:py-8 lg:px-14 lg:py-10 md:items-start",
          isSignUp
            ? ""
            : "",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="relative z-10 shrink-0">
          {logo ?? (
            <div className="text-2xl font-black leading-none text-secondary">
              P
            </div>
          )}
        </div>

        {/* Brand heading */}
        <div className="relative z-10 mt-2 hidden max-w-[360px] md:block">
          <h2 className="text-foreground text-3xl text-start">
            <TypingAnimation
              words={[
                "Let's learn to solve this Rubik's Cube!",
                "Let's crack this Rubik's Cube!",
                "Let's master this Rubik's Cube!",
              ]}
              loop
            />
          </h2>
        </div>

        {/* Cube */}
        <div
  className={[
    "absolute hidden md:block",
    "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "w-[200px] lg:w-[260px]",
    "transition-transform duration-700 ease-linear mt-10",
  ].join(" ")}
>
  <Image
    src={cubeSrc}
    alt="Rubik's cube"
    width={600}
    height={600}
    priority
    className="h-auto w-full object-contain"
  />
</div>

        {/* Switch button */}
        <AuthSwitchButton
          mode={mode}
          onSwitch={onSwitch}
          className={[
            "absolute bottom-3 z-20",
            "hidden md:block",
            "transition-[left,right] duration-700 ease-linear",
            isSignUp ? "right-auto left-3" : "right-3 left-auto",
          ].join(" ")}
        />
      </div>
    </section>
  );
}