"use client";

import React, { useState } from "react";
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
import { useTheme } from "next-themes";
import { authClient } from "@/src/lib/auth-client";
import { showToast } from "@/src/components/ui/toast";
import AdminGlowCard from "@/src/components/dashboard/admin/AdminGlowCard";
import Image from "next/image";

export interface ProfileMetric {
  label: string;
  value: string;
}

export interface ProfileIntroItem {
  icon: string;
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
  roleLabel: string;
  bio: string;
  metaItems?: ProfileMetaItem[];
  action?: { label: string; href: string };
  introItems?: ProfileIntroItem[];
  quickMetrics?: ProfileMetric[];
  chart?: ProfileChart;
}

export default function DashboardProfile({
  coverImage,
  roleLabel,
  bio,
  metaItems = [],
  action,
  introItems = [],
  quickMetrics = [],
  chart,
}: DashboardProfileProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const activeUser = session?.user;
  const { theme } = useTheme();
  const dark = theme === "dark";
  const primary = dark ? "#B978FF" : "#9F54F7";
  const gridStroke =
    "color-mix(in srgb, var(--color-foreground) 40%, transparent)";
  const tickColor = dark ? "#a8a8a8" : "#6b6b6b";

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
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
        image: activeUser?.image,
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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return showToast({
        variant: "error",
        message: "Please select a valid image file",
      });
    }

    setIsUpdatingAvatar(true);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    try {
      if (!apiKey) {
        throw new Error("Image upload service not configured");
      }

      const imgBBFormData = new FormData();
      imgBBFormData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        { method: "POST", body: imgBBFormData },
      );
      const data = await response.json();

      if (!data?.success) {
        throw new Error("Image upload failed");
      }

      const result = await authClient.updateUser({
        image: data.data.url,
        name: activeUser?.name,
      });

      if (result?.data) {
        showToast({ variant: "success", message: "Profile picture updated" });
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
    <div className="w-full font-urbanist text-foreground min-h-screen pb-12">
      {/* ============ COVER & AVATAR ============ */}
      <div className="dashboard-card relative !p-0 overflow-hidden">
        <div className="h-48 md:h-64 w-full relative bg-gradient-to-r from-primary/40 via-secondary/20 to-primary/40">
          <Image
            src={coverImage}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20">
          {/* avatar */}
          <div className="relative z-10">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-card bg-card shadow-xl text-3xl font-bold font-poppins relative overflow-hidden group">
              <Avatar.Image
                alt={activeUser?.name || roleLabel}
                src={activeUser?.image ?? undefined}
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
          <div className="flex-1 text-center md:text-left md:pt-10 mt-12">
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
                <h1 className="text-2xl md:text-3xl font-extrabold font-poppins text-foreground flex items-center justify-center md:justify-start gap-2 group">
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
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* left column */}
        <div className="space-y-6">
          <AdminGlowCard corner="top-left">
            <h3 className="text-lg font-bold font-poppins mb-3">Intro</h3>
            <div className="space-y-4 text-lg sm:text-base text-foreground/90 font-medium">
              {introItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </AdminGlowCard>

          {quickMetrics.length > 0 && (
            <AdminGlowCard corner="bottom-left">
              <h3 className="text-lg font-bold font-poppins mb-3">
                Quick Metrics
              </h3>
              <div
                className={`grid gap-2 text-center`}
                style={{
                  gridTemplateColumns: `repeat(${quickMetrics.length}, minmax(0, 1fr))`,
                }}
              >
                {quickMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[var(--color-card-soft)] rounded-xl border border-border/40"
                  >
                    <span className="block text-xl font-bold text-primary font-poppins">
                      {metric.value}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </AdminGlowCard>
          )}
        </div>

        {/* right column */}
        <div className="lg:col-span-1 space-y-6">
          {chart && chart.data.length > 0 && (
            <AdminGlowCard corner="bottom-right">
              <div className="pb-4 border-b border-border/50 mb-6">
                <h3 className="font-sans text-xl font-semibold text-foreground tracking-tight">
                  {chart.title}
                </h3>
                <p className="text-base sm:text-sm text-muted-foreground mt-0.5">
                  {chart.subtitle}
                </p>
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

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-base sm:text-sm text-muted-foreground font-semibold">
                <TrendingUp size={14} className="text-primary" />
                <span>{chart.subtitle}</span>
              </div>
            </AdminGlowCard>
          )}
        </div>
      </div>
    </div>
  );
}
