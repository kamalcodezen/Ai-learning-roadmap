"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useDashboardSession } from "../sessionGuard/SessionGuard";

interface ProfileCardProps {
  name?: string | null;
  email?: string | null;
  plan?: string | null;
  image?: string | null;
}

export default function ProfileCard({ name, email, plan, image }: ProfileCardProps) {
  const { data: session } = useDashboardSession();
  const [liveImage, setLiveImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const userImage = liveImage || image || session?.user?.image;
  const initial = (name?.trim() || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ image?: string }>;
      if (customEvent.detail?.image) {
        setLiveImage(customEvent.detail.image);
        setImgError(false);
      }
    };
    window.addEventListener("user-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("user-avatar-updated", handleAvatarUpdate);
  }, []);

  const userPlan = (plan || (session?.user as { plan?: string })?.plan || "FREE").toUpperCase();

  const getPlanBadge = () => {
    switch (userPlan) {
      case "PRO":
        return {
          label: "PRO TIER",
          icon: Crown,
          style: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30",
        };
      case "PLUS":
        return {
          label: "PLUS TIER",
          icon: Sparkles,
          style: "bg-primary/15 text-primary border-primary/30",
        };
      default:
        return {
          label: "GO TIER (FREE)",
          icon: Zap,
          style: "bg-muted text-muted-foreground border-border/50",
        };
    }
  };

  const badge = getPlanBadge();
  const Icon = badge.icon;
  const showImage = userImage && !imgError;

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      {/* Outer ring gauge layout */}
      <div className="relative mb-3 flex size-20 items-center justify-center rounded-full border-2 border-primary/30 p-1">
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" />
        {showImage ? (
          <div className="relative size-full overflow-hidden rounded-full ring-1 ring-primary/40">
            <Image
              src={userImage}
              alt={name || "User"}
              fill
              unoptimized
              sizes="80px"
              className="object-cover rounded-full"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary ring-1 ring-primary/40"
          >
            {initial}
          </span>
        )}
      </div>

      <div className="w-full min-w-0 px-2">
        <p className="truncate text-sm font-bold tracking-wider text-foreground uppercase">
          {name || "Guest User"}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {email || "—"}
        </p>

        {/* Dynamic Plan Badge */}
        <div className="mt-2.5 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border shadow-xs ${badge.style}`}
          >
            <Icon className="size-3 shrink-0" />
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  );
}
