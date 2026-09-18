"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Camera,
  Check,
  Edit2,
  Loader2,
  User,
  X,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@heroui/react";
import { authClient } from "@/src/lib/auth-client";
import { showToast } from "@/src/components/ui/toast";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import Image from "next/image";

export interface ProfileMetric {
  label: string;
  value: string;
}

export interface ProfileIntroItem {
  icon: React.ReactNode | string;
  label: string;
  value: React.ReactNode;
}

export interface ProfileMetaItem {
  icon: LucideIcon;
  label: string;
}

export interface ProfileChart {
  title: string;
  subtitle: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  tickFormatter?: (value: number) => string;
}

interface DashboardProfileProps {
  coverImage: string;
  coverImageDark?: string;
  roleLabel: string;
  bio: string;
  metaItems?: ProfileMetaItem[];
  action?: { label: string; href: string };
  introItems?: ProfileIntroItem[];
  quickMetrics?: ProfileMetric[];
  chart?: ProfileChart;
  leftColumnExtra?: React.ReactNode;
  rightColumnExtra?: React.ReactNode;
  children?: React.ReactNode;
}

export default function DashboardProfile({
  coverImage,
  coverImageDark,
  roleLabel,
  bio,
  metaItems = [],
  action,
  introItems = [],
  quickMetrics = [],
  chart,
  leftColumnExtra,
  rightColumnExtra,
  children,
}: DashboardProfileProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const activeUser = session?.user;

  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const syncTheme = () =>
      setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const primary = dark ? "#B978FF" : "#9F54F7";
  const gridStroke =
    "color-mix(in srgb, var(--color-foreground) 40%, transparent)";
  const tickColor = dark ? "#a8a8a8" : "#6b6b6b";

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const startEditName = () => {
    setUpdatedName(activeUser?.name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!updatedName.trim()) {
      return showToast({ variant: "error", message: "Name cannot be empty" });
    }
    if (updatedName === activeUser?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const result = await authClient.updateUser({
        name: updatedName.trim(),
        image: avatarPreview || activeUser?.image,
      });

      if (result?.data) {
        showToast({ variant: "success", message: "Display name updated" });
        setIsEditingName(false);
        router.refresh();
      }
      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      showToast({
        variant: "error",
        message: (error as Error)?.message || "Failed to update name",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input value so user can re-upload or select same file again
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return showToast({
        variant: "error",
        message: "Please select a valid image file (PNG, JPG, JPEG, WEBP)",
      });
    }

    if (file.size > 10 * 1024 * 1024) {
      return showToast({
        variant: "error",
        message: "Image size must be less than 10MB",
      });
    }

    setIsUpdatingAvatar(true);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    try {
      if (!apiKey) {
        throw new Error("ImgBB API key is not configured in .env");
      }

      const imgBBFormData = new FormData();
      imgBBFormData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        { method: "POST", body: imgBBFormData },
      );
      const data = await response.json();

      if (!data?.success || !data?.data?.url) {
        throw new Error(data?.error?.message || "Image upload failed");
      }

      const uploadedUrl = data.data.display_url || data.data.url;
      setAvatarPreview(uploadedUrl);

      // Dispatch event to instantly update sidebar, navbar, and other components without page reload
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("user-avatar-updated", {
            detail: { image: uploadedUrl },
          }),
        );
      }

      const result = await authClient.updateUser({
        image: uploadedUrl,
        name: activeUser?.name,
      });

      if (result?.data) {
        showToast({ variant: "success", message: "Profile picture updated successfully!" });
        router.refresh();
      }
      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      showToast({
        variant: "error",
        message:
          (error as Error)?.message || "Failed to update profile picture",
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="w-full font-urbanist text-foreground pb-6 animate-in fade-in duration-500">
      {/* ============ COVER & AVATAR ============ */}
      <div className="dashboard-card relative !p-0 overflow-hidden w-full">
        <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-primary/40 via-secondary/20 to-primary/40">
          <Image
            src={coverImageDark ? (dark ? coverImageDark : coverImage) : coverImage}
            alt="Profile Cover"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-80"
          />
        </div>

        <div className="w-full px-4 sm:px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20">
          {/* avatar */}
          <div className="relative z-10">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-card bg-card shadow-xl text-3xl font-bold font-poppins relative overflow-hidden group">
              <Avatar.Image
                alt={activeUser?.name || roleLabel}
                src={avatarPreview || activeUser?.image || undefined}
                referrerPolicy="no-referrer"
              />
              <Avatar.Fallback>
                <User size={40} />
              </Avatar.Fallback>

              {isUpdatingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-primary z-20">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </Avatar>

            <label className="absolute bottom-2 right-2 bg-primary text-background p-2 rounded-full shadow-lg hover:opacity-90 transition-all cursor-pointer border-2 border-card flex items-center justify-center select-none">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUpdatingAvatar}
                className="hidden"
              />
            </label>
          </div>

          {/* name & bio */}
          <div className="flex-1 text-center md:text-left md:pt-10 mt-0 md:mt-12">
            <div className="flex items-center justify-center md:justify-start gap-3 h-10">
              {isEditingName ? (
                <div className="flex items-center gap-2 bg-card border border-border px-2 py-1 rounded-xl shadow-sm max-w-xs w-full">
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    disabled={isSavingName}
                    className="bg-transparent text-lg sm:text-base font-bold font-poppins w-full focus:outline-none px-1 text-foreground"
                    placeholder="Enter full name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-1 hover:bg-emerald-500/10 rounded-md text-emerald-500 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {isSavingName ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    disabled={isSavingName}
                    className="p-1 hover:bg-red-500/10 rounded-md text-red-500 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <h1 className="text-[13px] md:text-3xl xl:text-2xl font-extrabold font-poppins text-foreground flex items-center justify-center md:justify-start gap-2 group">
                  {activeUser?.name || roleLabel}
                  <button
                    onClick={startEditName}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary opacity-60 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center"
                    title="Edit Name"
                  >
                    <Edit2 size={16} />
                  </button>
                  <span className="text-base sm:text-sm bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider h-5 flex items-center font-urbanist">
                    {(activeUser as { role?: string } | undefined)?.role ||
                      roleLabel}
                  </span>
                  {((activeUser as { role?: string } | undefined)?.role || "").toUpperCase() !== "ADMIN" && (
                    <span className={`text-base sm:text-sm font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider h-5 flex items-center font-urbanist border ${
                      ((activeUser as { plan?: string } | undefined)?.plan || "FREE").toUpperCase() === "PRO"
                        ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30"
                        : ((activeUser as { plan?: string } | undefined)?.plan || "FREE").toUpperCase() === "PLUS"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-muted text-muted-foreground border-border/50"
                    }`}>
                      {((activeUser as { plan?: string } | undefined)?.plan || "FREE").toUpperCase()} TIER
                    </span>
                  )}
                </h1>
              )}
            </div>

            <p className="text-lg sm:text-base text-muted-foreground mt-2 font-medium">
              {bio}
            </p>

            {/* meta row */}
            {metaItems.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-base sm:text-sm text-muted-foreground font-semibold">
                {metaItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <span key={idx} className="flex items-center gap-1">
                      <Icon size={14} /> {item.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* action */}
          {action && (
            <div className="flex gap-2 mt-4 md:mt-0 flex-shrink-0">
              <Link
                href={action.href}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-lg sm:text-base rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                {action.label}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ============ TIMELINE LAYOUT ============ */}
      <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-2 items-start dashboard-card-gap">
        {/* left column */}
        <div className="space-y-6">
          <GlowCard corner="top-left">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
              <h3 className="text-base font-bold font-poppins text-foreground">Intro &amp; Profile Details</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Overview</span>
            </div>
            <div className="space-y-3 text-sm text-foreground/90 font-medium">
              {introItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {typeof item.icon === "string" ? (
                      <span className="text-base">{item.icon}</span>
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div className="truncate text-sm font-semibold text-foreground mt-0.5">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>

          {quickMetrics.length > 0 && (
            <GlowCard corner="bottom-left">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                <h3 className="text-base font-bold font-poppins text-foreground">
                  Quick Metrics
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="group/metric relative overflow-hidden p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <span className="block text-2xl font-black text-foreground font-poppins tracking-tight group-hover/metric:text-primary transition-colors">
                      {metric.value}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1 block">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}

          {leftColumnExtra}
        </div>

        {/* right column */}
        <div className="lg:col-span-1 space-y-6">
          {chart && chart.data.length > 0 && (
            <GlowCard corner="bottom-right" className="h-full">
              <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-4">
                <div>
                  <h3 className="text-base font-bold font-poppins text-foreground tracking-tight">
                    {chart.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chart.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <TrendingUp size={13} />
                  <span>Analytics</span>
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chart.data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="profilePrimary"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={primary}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey={chart.xKey}
                      stroke={gridStroke}
                      tick={{ fontSize: 12, fill: tickColor }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={gridStroke}
                      tick={{ fontSize: 12, fill: tickColor }}
                      tickLine={false}
                      tickFormatter={chart.tickFormatter}
                    />
                    <Tooltip
                      contentStyle={{
                        background: dark ? "#1a1a1a" : "#ffffff",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        color: "var(--color-text-primary)",
                      }}
                      labelStyle={{ color: "var(--color-text-primary)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chart.yKey}
                      stroke={primary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#profilePrimary)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primary" />
                  {chart.subtitle}
                </span>
                <span className="text-primary font-bold">Platform Feed</span>
              </div>
            </GlowCard>
          )}

          {rightColumnExtra}
        </div>
      </div>

      {/* ============ OPTIONAL CHILDREN EXTENSIONS ============ */}
      {children && (
        <div className="w-full mt-6">
          {children}
        </div>
      )}
    </div>
  );
}


