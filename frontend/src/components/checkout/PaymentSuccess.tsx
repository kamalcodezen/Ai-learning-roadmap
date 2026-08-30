"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  Check,
  CircleX,
  CreditCard,
  Crown,
  CalendarDays,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Button from "../ui/button";
import BackToHome from "../ui/BackToHome";
import { BorderBeam } from "@/src/components/ui/border-beam";

const DownloadReceiptButton = dynamic(
  () =>
    import("@/src/components/pdf/DownloadReceiptButton").then(
      (mod) => mod.DownloadReceiptButton
    ),
  { ssr: false }
);

interface PaymentSuccessProps {
  sessionId?: string | null;
  customerEmail?: string | null;
  planName?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  interval?: string | null;
  status?: "success" | "cancelled";
}

export default function PaymentSuccess({
  sessionId,
  customerEmail,
  planName,
  amountTotal,
  currency,
  interval,
  status = "success",
}: PaymentSuccessProps) {
  const router = useRouter();
  const isCancelled = status === "cancelled";

  useEffect(() => {
    const raw = sessionStorage.getItem("checkout_metadata");
    if (!raw) return;
    try {
      const stored = JSON.parse(raw) as Record<string, unknown>;
      console.log("Checkout metadata:", { ...stored, session_id: sessionId ?? null });
    } catch {
    }
  }, [sessionId]);

  useEffect(() => {
    if (isCancelled) return;

    const defaults = {
      spread: 100,
      ticks: 120,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      origin: { y: 0.35 },
      colors: ["#9F54F7", "#B978FF", "#8523F5", "#F7F7F7", "#E6D8FF"],
    };

    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({ ...defaults, ...opts, particleCount: Math.floor(180 * particleRatio) });

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [isCancelled]);

  const amountLabel = useMemo(() => {
    if (!amountTotal || !currency) return null;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amountTotal / 100);

    return interval === "year" ? `${formatted} / year` : `${formatted} / month`;
  }, [amountTotal, currency, interval]);

  const sessionLabel = useMemo(() => {
    if (!sessionId) return null;
    return sessionId.length > 16
      ? `${sessionId.slice(0, 16)}…`
      : sessionId;
  }, [sessionId]);

  const rows = [
    planName && { icon: Crown, label: "Plan", value: planName },
    amountLabel && { icon: CreditCard, label: "Amount", value: amountLabel },
    interval && {
      icon: CalendarDays,
      label: "Billing",
      value: interval === "year" ? "Yearly" : "Monthly",
    },
    { icon: ShieldCheck, label: "Status", value: "Active" },
    sessionLabel && { icon: CreditCard, label: "Session", value: sessionLabel },
  ].filter(Boolean) as Array<{
    icon: typeof Crown;
    label: string;
    value: string;
  }>;

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f4edff] px-5 py-16 dark:bg-[#120a1e]">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#9F54F7]/20 blur-3xl dark:bg-[#9F54F7]/25" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#8523F5]/10 blur-3xl dark:bg-[#8523F5]/20" />

<motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-primary/40 bg-[linear-gradient(to_bottom,#fcfaff_0%,#f4eeff_45%,#e9dcff_100%)] p-8 dark:bg-[linear-gradient(to_bottom,rgba(243,232,255,0.12)_0%,rgba(237,229,255,0.08)_45%,rgba(221,208,255,0.05)_100%)] sm:p-10"
        >
          <BackToHome />
          <BorderBeam
          duration={6}
          size={200}
          borderWidth={2}
          className="from-transparent via-[#9F54F7] to-transparent"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={200}
          borderWidth={2}
          className="from-transparent via-[#c084fc] to-transparent"
        />
        {/* Confirmation pill */}
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-secondary dark:text-primary">
          <span className="text-sm">✦</span>
          {isCancelled ? "Checkout Cancelled" : "Payment Confirmed"}
        </div>

        {/* Status icon */}
        <div className="mt-8 flex justify-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_10px_40px_rgba(159,84,247,0.5)] ${
              isCancelled
                ? "bg-gradient-to-br from-[#6b7280] to-[#4b5563] shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                : "bg-gradient-to-br from-[#9F54F7] to-[#8523F5]"
            }`}
          >
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.05, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-0 rounded-full ring-4 ${
                isCancelled ? "ring-slate-400/25" : "ring-primary/25"
              }`}
            />
            {isCancelled ? (
              <CircleX className="h-12 w-12 text-white" strokeWidth={2.5} />
            ) : (
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            )}
          </motion.div>
        </div>

        {/* Heading */}
        <div className="mt-7 text-center">
          <h1 className="font-poppins text-3xl font-bold text-foreground sm:text-4xl">
            {isCancelled
              ? "Payment not completed — nothing was charged"
              : planName
                ? `Welcome to ${planName}`
                : "Payment Successful"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {isCancelled ? (
              <>
                Your checkout was cancelled, so no money has been deducted and
                your plan hasn&apos;t changed. You can pick up right where you
                left off whenever you&apos;re ready.
              </>
            ) : (
              <>
                Your subscription is active. Your personalized learning roadmap
                is ready — let&apos;s map out your next step.
              </>
            )}
          </p>
        </div>

        {/* Order details */}
        {!isCancelled && rows.length > 0 && (
          <div className="mt-8 space-y-3 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md dark:bg-card/40">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </span>
                <span className="text-right text-sm font-semibold text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isCancelled && customerEmail && (
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            A confirmation email was sent to{" "}
            <span className="font-medium text-foreground">{customerEmail}</span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isCancelled ? (
            <>
              <Button
                text="Browse Plans"
                onClick={() => router.push("/#pricing")}
                className="w-fit md:w-auto"
              />
              <Button
                text="Try Again"
                variant="soft"
                onClick={() => router.back()}
                className="w-fit md:w-auto"
              />
            </>
          ) : (
            <>
              <Button
                text="Go to Homepage"
                onClick={() => router.push("/")}
                className="w-fit md:w-auto"
              />
              {sessionId && (
                <DownloadReceiptButton
                  sessionId={sessionId}
                  planName={planName}
                  amountTotal={amountTotal}
                  currency={currency}
                  interval={interval}
                />
              )}
            </>
          )}
        </div>

        {!isCancelled && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need to manage your subscription? Visit{" "}
            <span className="font-medium text-primary">Billing Settings</span> in your dashboard anytime.
          </p>
        )}
      </motion.section>
    </main>
  );
}