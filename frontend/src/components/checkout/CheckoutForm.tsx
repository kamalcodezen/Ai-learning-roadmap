"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";
import type { PricingPlan } from "../home/pricing/plans";
import Button from "../ui/button";

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

  const isStarter = plan.slug === "starter";
  const isEnterprise = plan.slug === "enterprise";

  const priceId = billing === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;
  const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const priceLabel = `$${price} / ${billing === "yearly" ? "year" : "month"}`;

  const ctaLabel = isEnterprise
    ? "Contact Sales"
    : isStarter
      ? "Get Started Free"
      : "Continue to Checkout";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isEnterprise) {
      event.preventDefault();
      window.location.href = "mailto:sales@aipather.com";
      return;
    }

    if (isStarter) {
      event.preventDefault();
      router.push("/dashboard");
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

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f4edff] px-5 py-16 dark:bg-[#120a1e]">
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#9F54F7]/20 blur-3xl dark:bg-[#9F54F7]/25" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#8523F5]/10 blur-3xl dark:bg-[#8523F5]/20" />

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-primary/40 bg-[linear-gradient(to_bottom,#fcfaff_0%,#f4eeff_45%,#e9dcff_100%)] p-8 dark:bg-[linear-gradient(to_bottom,rgba(243,232,255,0.12)_0%,rgba(237,229,255,0.08)_45%,rgba(221,208,255,0.05)_100%)] sm:p-10"
      >
        {/* Checkout pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-secondary dark:text-primary">
          <span className="text-sm">✦</span>
          Checkout · Step 1 of 2
        </div>

        {/* Heading */}
        <div className="mt-6">
          <h1 className="font-poppins text-3xl font-bold text-foreground sm:text-4xl">
            {plan.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {plan.description}
          </p>
        </div>

        {/* Plan summary */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md dark:bg-card/40">
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

        {isEnterprise && (
          <p className="mt-3 text-xs text-muted-foreground">
            Enterprise plans are sold per organization. Fill this in and our sales team will reach out.
          </p>
        )}

        {/* Form */}
        <form
          ref={formRef}
          action={!isStarter && !isEnterprise && priceId ? "/api/checkout_sessions" : undefined}
          method="POST"
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          {!isStarter && !isEnterprise && priceId && (
            <input type="hidden" name="priceId" value={priceId} />
          )}

          <Field label="Full Name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              required
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

          {!isStarter && !isEnterprise && !priceId && (
            <p className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              This plan is not configured for online checkout yet. Please contact support.
            </p>
          )}

          <div className="pt-1">
            <Button
              text={ctaLabel}
              onClick={() => formRef.current?.requestSubmit()}
              className="w-full"
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
          onClick={() => router.push("/#pricing")}
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing Plans
        </button>
      </motion.section>
    </main>
  );
}