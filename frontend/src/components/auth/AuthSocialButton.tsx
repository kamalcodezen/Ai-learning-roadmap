"use client";

import { Button } from "@heroui/react";
import { authClient } from "../../lib/auth-client";

interface AuthSocialButtonProps {
  isPending?: boolean;
}

function GoogleIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center font-bold text-brand"
    >
      G
    </span>
  );
}

export default function AuthSocialButton({
  isPending = false,
}: AuthSocialButtonProps) {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
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
        h-11
        rounded-lg
        border-border
        bg-transparent
        text-sm
        font-medium
        text-foreground
        shadow-none
        hover:bg-muted
      "
    >
      <GoogleIcon />
      <span>Sign up with Google</span>
    </Button>
  );
}