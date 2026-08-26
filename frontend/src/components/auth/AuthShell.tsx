"use client";

import { useState } from "react";
import AuthBrandPanel from "./AuthBrandPanel";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import type { AuthShellProps } from "./auth.types";

export default function AuthShell({
  initialMode,
  logo,
  cubeSrc,
}: AuthShellProps) {
  const [mode, setMode] = useState(initialMode);

  const isSignUp = mode === "signup";

  const switchMode = () => {
    const target = isSignUp ? "/signin" : "/signup";
    window.history.pushState({}, "", target);
    setMode((current) =>
      current === "signup" ? "signin" : "signup",
    );
  };

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center p-4 text-white!">
      <div
        className="
          relative
          flex flex-col
          w-full
          max-w-5xl
          h-fit
          md:min-h-[85vh]
          shadow-2xl
          rounded-3xl
          overflow-hidden
          bg-black/60
        "
      >
        {/* Moving green brand section */}
        <AuthBrandPanel
          mode={mode}
          logo={logo}
          cubeSrc={cubeSrc}
          onSwitch={switchMode}
        />

        {/* Sign Up */}
        <section
          aria-hidden={!isSignUp}
          className={[
            "relative z-10 w-full",
            "md:absolute md:left-[50%] md:top-0 md:h-full md:w-[50%]",
            isSignUp
              ? "opacity-100 max-md:block"
              : "pointer-events-none opacity-0 max-md:hidden",
            "transition-[left,top,opacity] duration-700 ease-linear",
          ].join(" ")}
        >
          <SignUpForm onSwitch={switchMode} />
        </section>

        {/* Sign In */}
        <section
          aria-hidden={isSignUp}
          className={[
            "relative z-10 w-full",
            "md:absolute md:left-0 md:top-0 md:h-full md:w-[50%]",
            isSignUp
              ? "pointer-events-none opacity-0 max-md:hidden"
              : "opacity-100 max-md:block",
            "transition-[left,top,opacity] duration-700 ease-linear",
          ].join(" ")}
        >
          <SignInForm onSwitch={switchMode} />
        </section>
      </div>
    </main>
  );
}