"use client";

import Image from "next/image";
import AuthSwitchButton from "./AuthSwitchButton";
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
        "md:absolute md:h-full md:w-[40%]",
        isSignUp ? "md:left-0 md:top-0" : "md:left-[60%] md:top-0",
        "bg-linear-to-b from-[#d5f051] to-[#64a331]",
        "transition-[left,top,width,height] duration-700 ease-linear",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex h-full w-full flex-col items-center text-center px-7 py-6 sm:px-10 sm:py-8 md:px-10 md:py-8 lg:px-14 lg:py-10",
          isSignUp
            ? "md:items-start md:text-left"
            : "md:items-end md:text-right",
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
          <h1 className="font-sans text-lg font-bold leading-[1.05] tracking-tight text-secondary sm:text-xl lg:text-2xl">
            Let&apos;s learn to solve
            <br />
            this Rubik&apos;s Cube!
          </h1>
        </div>

        {/* Cube */}
        <div
          className={[
            "absolute hidden md:block",
            "left-1/2 top-[52%]",
            "w-[220px] -translate-x-1/2",
            "sm:w-[200px]",
            "md:left-[48%] md:top-[30%] md:w-[200px]",
            "lg:w-[260px]",
            "transition-transform duration-700 ease-linear",
            isSignUp
              ? "translate-x-[-38%] sm:translate-x-[-32%] md:translate-x-[-8%]"
              : "translate-x-[-62%] sm:translate-x-[-68%] md:translate-x-[-92%]",
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