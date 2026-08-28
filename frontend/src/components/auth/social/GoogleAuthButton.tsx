"use client";

import { Button } from "@heroui/react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "../../../lib/auth-client";
import type { AuthMode } from "../auth.types";

interface GoogleAuthButtonProps {
  mode: AuthMode;
  isPending?: boolean;
}

export default function GoogleAuthButton({
  mode,
  isPending = false,
}: GoogleAuthButtonProps) {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/auth-success",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      isPending={isPending}
      onPress={handleGoogleSignIn}
      className="
        h-10
        rounded-lg
        border-zinc-500
        bg-transparent
        text-sm
        font-medium
        text-white
        shadow-none
        hover:bg-muted
        hover:text-foreground
        dark:hover:text-white
      "
    >
      <FcGoogle className="text-2xl" />
      <span>{mode === "signup" ? "Sign up" : "Sign in"} with Google</span>
    </Button>
  );
}
