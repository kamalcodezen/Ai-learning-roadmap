"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";
import brandLogo from "../../../public/brand/AI-Pather-blue.png";
import type { PricingPlan } from "../home/pricing/plans";
import Button from "../ui/button";
import BackToHome from "../ui/BackToHome";
import { BorderBeam } from "@/src/components/ui/border-beam";
import { authClient } from "@/src/lib/auth-client";
import BrandLoader from "@/src/components/shared/BrandLoader";

type BillingPeriod = "monthly" | "yearly";

interface CheckoutFormProps {
  plan: PricingPlan;
  billing: BillingPeriod;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, htmlFor, hint, required = true, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}{" "}
        {required && <span className="text-secondary dark:text-primary">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

const inputClasses =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function CheckoutForm({ plan, billing }: CheckoutFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  const isStarter =
    plan.slug === "starter" ||
    plan.slug === "go-ai-pather" ||
    plan.monthlyPrice === 0;

  const priceId = billing === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;
  const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const priceLabel = `$${price} / ${billing === "yearly" ? "year" : "month"}`;

  const ctaLabel = isStarter ? "Get Started Free" : "Continue to Checkout";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isStarter) {
      event.preventDefault();
      router.push("/dashboard/learner");
      return;
    }

    // Paid plan: only proceed when a Stripe price is configured.
    if (!priceId) {
      event.preventDefault();
      return;
    }

    const values = new FormData(event.currentTarget);
    const metadata = {
      plan: plan.name,
      customerName: values.get("name"),
      customerEmail: values.get("email"),
      note: values.get("note"),
      billing,
    };
    sessionStorage.setItem("checkout_metadata", JSON.stringify(metadata));
  };

  if (isPending || !session?.user) {
    return <BrandLoader message="Preparing checkout..." />;
  }

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
          className="relative w-full max-w-xl overflow-visible rounded-3xl border border-primary/40 bg-[linear-gradient(to_bottom,#fcfaff_0%,#f4eeff_45%,#e9dcff_100%)] p-8 dark:bg-[linear-gradient(to_bottom,rgba(243,232,255,0.12)_0%,rgba(237,229,255,0.08)_45%,rgba(221,208,255,0.05)_100%)] sm:p-10 md:grid md:max-w-4xl md:grid-cols-2 md:items-start md:gap-8"
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
        {/* Brand + Plan summary — left column on md+ */}
        <div className="md:flex md:flex-col">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image
              src={brandLogo}
              alt="Brand-logo"
              className="ml-1 h-fit dark:invert"
              height={20}
              width={20}
            />
            <span className="font-sans text-[30px] font-semibold tracking-[-0.03em] text-foreground">
              Ai Pather
            </span>
          </Link>

          {/* Plan summary */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md dark:bg-card/40 md:mt-4 md:flex-col md:items-start md:gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              {plan.name}
              <span className="text-xs text-muted-foreground">
                {billing === "yearly" ? "· billed annually" : "· billed monthly"}
              </span>
            </div>
            <span className="shrink-0 text-lg font-bold text-secondary dark:text-primary">
              {priceLabel}
            </span>
          </div>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          action={!isStarter && priceId ? "/api/checkout_sessions" : undefined}
          method="POST"
          onSubmit={handleSubmit}
          className="mt-7 space-y-5 md:row-span-2 md:mt-0"
        >
          {!isStarter && priceId && (
            <>
              <input type="hidden" name="priceId" value={priceId} />
              <input type="hidden" name="customerEmail" value={session?.user?.email || ""} />
              <input type="hidden" name="userId" value={session?.user?.id || ""} />
              <input type="hidden" name="planName" value={plan.name} />
              <input type="hidden" name="billing" value={billing} />
            </>
          )}

          <Field label="Full Name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={session.user.name || ""}
              autoComplete="name"
              placeholder="e.g. Alif Rahman"
              className={inputClasses}
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={session.user.email || ""}
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClasses}
            />
          </Field>

          <Field label="Additional Note (optional)" htmlFor="note" required={false}>
            <textarea
              id="note"
              name="note"
              rows={3}
              maxLength={500}
              placeholder="Anything we should know about your career goals?"
              className={`${inputClasses} resize-none`}
            />
          </Field>

          {!isStarter && !priceId && (
            <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              This plan is not configured for online checkout yet. Please contact support.
            </p>
          )}

          <div className="flex flex-col items-center pt-1">
            <Button
              text={ctaLabel}
              onClick={() => formRef.current?.requestSubmit()}
              className="w-fit"
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              <Lock className="mr-1 inline h-3 w-3" />
              Secure checkout powered by Stripe · your payment details never touch our servers
            </p>
          </div>
        </form>

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/pricing")}
          className="mt-6 md:mt-49 flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing Plans
        </button>
      </motion.section>
    </main>
  );
}