import type { Metadata } from "next";

import PaymentSuccess from "@/src/components/checkout/PaymentSuccess";
import { stripe } from "@/src/lib/stripe";

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
        planName = lineItem?.description ?? null;
        interval = lineItem?.price?.recurring?.interval ?? null;
        amountTotal = session.amount_total ?? null;
        currency = session.currency ?? null;
        customerEmail =
          session.customer_details?.email ??
          (session.customer_email as string | null) ??
          null;
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