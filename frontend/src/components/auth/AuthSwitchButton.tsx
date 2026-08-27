"use client";

import type { AuthMode } from "./auth.types";

interface AuthSwitchButtonProps {
  mode: AuthMode;
  onSwitch: () => void;
  className?: string;
}

export default function AuthSwitchButton({
  mode,
  onSwitch,
  className = "",
}: AuthSwitchButtonProps) {
  const isSignUp = mode === "signup";

  return (
    <button
      type="button"
      onClick={onSwitch}
      className={`
        rounded-full
        bg-foreground
        w-[93%]
        py-2
        text-sm
        font-medium
         text-background
        transition-[filter]
        duration-300
        hover:brightness-105
        ${className}
      `}
    >
      {isSignUp ? "Log In" : "Create Account"}
    </button>
  );
}