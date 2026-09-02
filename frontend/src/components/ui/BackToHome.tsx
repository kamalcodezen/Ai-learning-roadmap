"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackToHome() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="absolute left-0 -top-12 z-20 flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-colors duration-300 hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to home
    </button>
  );
}