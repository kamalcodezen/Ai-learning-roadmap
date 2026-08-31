"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { authClient } from "@/src/lib/auth-client";

interface SignOutButtonProps {
  onSignOut?: () => void;
}

export default function SignOutButton({ onSignOut }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          onSignOut?.();
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          onSignOut?.();
          router.replace("/");
          router.refresh();
        },
      },
    });

    setIsSigningOut(false);
  };

  return (
    <div className="shrink-0 border-t border-border p-3">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-label="Sign out of your account"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400 transition-colors duration-200 hover:bg-red-500 hover:text-white dark:border-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSigningOut ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4" aria-hidden="true" />
        )}
        {isSigningOut ? "Signing out…" : "Sign Out"}
      </button>
    </div>
  );
}
