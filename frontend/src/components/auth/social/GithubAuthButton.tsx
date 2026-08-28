"use client";

import { Button } from "@heroui/react";
import { FaGithub } from "react-icons/fa";
import { authClient } from "../../../lib/auth-client";
import type { AuthMode } from "../auth.types";

interface GithubAuthButtonProps {
  mode: AuthMode;
  isPending?: boolean;
}

export default function GithubAuthButton({
  mode,
  isPending = false,
}: GithubAuthButtonProps) {
  const handleGithubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/auth-success",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      isPending={isPending}
      onPress={handleGithubSignIn}
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
      <FaGithub className="text-2xl" />
      <span>{mode === "signup" ? "Sign up" : "Sign in"} with GitHub</span>
    </Button>
  );
}
