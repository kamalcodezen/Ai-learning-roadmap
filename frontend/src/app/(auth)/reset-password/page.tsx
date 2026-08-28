"use client";

import { useState, Suspense } from "react";
import { authClient } from "@/src/lib/auth-client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LightRays from "@/src/components/auth/LightRays";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsPending(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setError(resetError.message ?? "Failed to reset password. The link might have expired.");
    } else {
      setSuccess(true);
    }
    
    setIsPending(false);
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
          <p className="text-sm font-medium text-red-400">
            Invalid link. No reset token was found.
          </p>
        </div>
        <Link href="/forgot-password" className="text-sm font-medium text-brand hover:text-brand/80 block">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20">
          <p className="text-sm font-medium text-green-400">
            Password has been successfully reset!
          </p>
        </div>
        <Link href="/signin" className="inline-block mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-105 transition-all">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
          <p className="text-sm font-medium text-red-400">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 bg-zinc-900/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border-0 bg-zinc-900/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full justify-center rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/40 px-6 py-8">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={2.5}
        rayLength={40}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        fadeDistance={1}
        saturation={1}
      />
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl bg-zinc-950/80 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Choose a new password</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Make sure it is at least 8 characters long.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-zinc-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
