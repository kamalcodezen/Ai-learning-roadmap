"use client";

import GoogleAuthButton from "./social/GoogleAuthButton";
import GithubAuthButton from "./social/GithubAuthButton";
import type { AuthMode } from "./auth.types";

interface AuthSocialButtonProps {
  mode?: AuthMode;
  isPending?: boolean;
}

export default function AuthSocialButton({
  mode = "signin",
  isPending = false,
}: AuthSocialButtonProps) {
  return (
    <div className="space-y-3 flex flex-col gap-3 md:flex-row">
      <GoogleAuthButton mode={mode} isPending={isPending} />
      <GithubAuthButton mode={mode} isPending={isPending} />
    </div>
  );
}
