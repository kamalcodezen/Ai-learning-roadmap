"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import Link from "next/link";
import LightRays from "@/src/components/auth/LightRays";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const { error: resetError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (resetError) {
      setError(resetError.message ?? "Failed to send reset link");
    } else {
      setSuccess(true);
    }
    
    setIsPending(false);
  };

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
          <h2 className="text-3xl font-bold tracking-tight text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-400">
              Reset link sent! Please check your email inbox.
            </p>
            <div className="mt-4">
              <Link href="/signin" className="text-sm font-medium text-brand hover:text-brand/80">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 bg-zinc-900/50 py-2.5 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
            
            <p className="mt-10 text-center text-sm text-zinc-400">
              Remember your password?{" "}
              <Link href="/signin" className="font-semibold leading-6 text-brand hover:text-brand/80">
                Sign in here
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
