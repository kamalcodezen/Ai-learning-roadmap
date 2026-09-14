import type { Metadata } from "next";

import PaymentSuccess from "@/src/components/checkout/PaymentSuccess";
import { stripe } from "@/src/lib/stripe";
import { pool } from "@/src/lib/auth";

export const metadata: Metadata = {
  title: "Payment · AI Pather",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[]; canceled?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const canceled = Array.isArray(params.canceled)
    ? params.canceled[0]
    : params.canceled;

  // Came back from checkout with explicit cancellation.
  if (canceled === "true") {
    return <PaymentSuccess status="cancelled" />;
  }

  let status: "success" | "cancelled" = "cancelled";
  let planName: string | null = null;
  let customerEmail: string | null = null;
  let amountTotal: number | null = null;
  let currency: string | null = null;
  let interval: string | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });

      const lineItem = session.line_items?.data?.[0];

      if (session.status === "complete") {
        status = "success";
        const rawDescription = lineItem?.description || "";
        const priceId = lineItem?.price?.id;

        if (
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ||
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ||
          rawDescription.toLowerCase().includes("career os") ||
          rawDescription.toLowerCase().includes("plus")
        ) {
          planName = "AI Pather Plus";
        } else if (
          priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
          priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID ||
          rawDescription.toLowerCase().includes("enterprise") ||
          rawDescription.toLowerCase().includes("pro")
        ) {
          planName = "AI Pather Pro";
        } else {
          planName = rawDescription.replace(/-\s*Monthly/gi, "").replace(/-\s*Yearly/gi, "").trim() || "AI Pather Plus";
        }

        interval = lineItem?.price?.recurring?.interval ?? null;
        amountTotal = session.amount_total ?? null;
        currency = session.currency ?? null;
        customerEmail =
          session.customer_details?.email ??
          (session.customer_email as string | null) ??
          null;

        // Automatically update user plan to PLUS or PRO on successful checkout
        if (customerEmail) {
          const upgradedPlan = planName?.includes("Pro") ? "PRO" : "PLUS";
          try {
            await pool.query('UPDATE "user" SET plan = $1 WHERE email = $2', [
              upgradedPlan,
              customerEmail,
            ]);
          } catch (dbErr) {
            console.error("Failed to update user plan on payment success:", dbErr);
          }
        }
      }
    } catch {
      // Session not found / invalid — fall through to the cancelled state.
    }
  } else {
    // No session and no explicit cancel — treat as an incomplete checkout.
    status = "cancelled";
  }

  return (
    <PaymentSuccess
      status={status}
      sessionId={status === "success" ? (sessionId ?? null) : null}
      customerEmail={customerEmail}
      planName={planName}
      amountTotal={amountTotal}
      currency={currency}
      interval={interval}
    />
  );
}