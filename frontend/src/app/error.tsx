"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  LuRefreshCw,
  LuLayoutDashboard,
  LuCopy,
  LuCheck,
  LuTriangleAlert,
} from "react-icons/lu";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("Runtime Error:", error);
  }, [error]);

  const handleCopyLog = async () => {
    const errorText = [
      "AI Pather Runtime Error",
      `Digest: ${error?.digest || "N/A"}`,
      `Message: ${error?.message || "Unknown runtime error"}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error("Failed to copy error details:", copyError);
    }
  };

  const errorMessage =
    error?.message || "We couldn't load this page right now.";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[rgb(var(--background))] px-4 py-12 text-[rgb(var(--foreground))]">
      <div className="relative w-full max-w-2xl">
        {/* Subtle Brand Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--primary))]/8 blur-3xl"
        />

        <div className="relative">
          {/* Error Icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgb(var(--primary))]/20 bg-[rgb(var(--primary))]/10">
              <LuTriangleAlert
                className="h-8 w-8 text-[rgb(var(--primary))]"
                strokeWidth={1.8}
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-center"
          >
            <p className="mb-3 text-sm font-semibold tracking-wide text-[rgb(var(--primary))]">
              Something went wrong
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-[rgb(var(--foreground))] sm:text-4xl">
              We couldn&apos;t load this page
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[rgb(var(--muted-foreground))] sm:text-base">
              An unexpected error occurred while loading this page. Please try
              again or return to your dashboard.
            </p>
          </motion.div>

          {/* Error Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="dashboard-card mt-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  Error details
                </p>

                {error?.digest && (
                  <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                    Reference: {error.digest}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyLog}
                className="btn-secondary inline-flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-medium"
                title="Copy error details"
                aria-label="Copy error details"
              >
                {copied ? (
                  <>
                    <LuCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <LuCopy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))] p-4">
              <p className="break-words text-sm leading-6 text-[rgb(var(--muted-foreground))]">
                {errorMessage}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <button
              type="button"
              onClick={reset}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <LuRefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/dashboard/learner"
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <LuLayoutDashboard className="h-4 w-4 text-[rgb(var(--primary))]" />
              <span>Back to Dashboard</span>
            </Link>
          </motion.div>

          {/* Small Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-6 text-center text-xs text-[rgb(var(--muted-foreground))]"
          >
            Your session is safe. You can retry without losing your progress.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
