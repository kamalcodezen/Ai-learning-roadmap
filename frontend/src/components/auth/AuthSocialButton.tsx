"use client";

import { Button } from "@heroui/react";
import { authClient } from "../../lib/auth-client";
import { FcGoogle } from "react-icons/fc";

interface AuthSocialButtonProps {
  isPending?: boolean;
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
        h-10
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
      <FcGoogle className="text-2xl" />
      <span>Sign up with Google</span>
    </Button>
  );
}