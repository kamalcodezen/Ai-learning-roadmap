import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/src/lib/stripe";
import { pool } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In local development or testing without webhook secret configured
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error(`[Stripe Webhook Error]: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          (session.metadata?.customerEmail as string | undefined);

        if (customerEmail) {
          // Retrieve line items or metadata to determine plan
          const planNameMeta = (session.metadata?.planName || "").toLowerCase();
          const isPro =
            planNameMeta.includes("pro") ||
            planNameMeta.includes("enterprise");
          const plan = isPro ? "PRO" : "PLUS";

          await pool.query('UPDATE "user" SET plan = $1 WHERE email = $2', [
            plan,
            customerEmail,
          ]);
          console.log(`[Stripe Webhook] Upgraded user ${customerEmail} to ${plan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Retrieve customer from Stripe to find their email
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && customer.email) {
            await pool.query('UPDATE "user" SET plan = $1 WHERE email = $2', [
              "FREE",
              customer.email,
            ]);
            console.log(`[Stripe Webhook] Subscription cancelled. Reverted user ${customer.email} to FREE`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && customer.email) {
            if (status === "canceled" || status === "unpaid" || status === "past_due") {
              await pool.query('UPDATE "user" SET plan = $1 WHERE email = $2', [
                "FREE",
                customer.email,
              ]);
              console.log(`[Stripe Webhook] Subscription status ${status}. Set user ${customer.email} to FREE`);
            } else if (status === "active") {
              const planMeta = (subscription.metadata?.planName || "").toLowerCase();
              const plan = planMeta.includes("pro") ? "PRO" : "PLUS";
              await pool.query('UPDATE "user" SET plan = $1 WHERE email = $2', [
                plan,
                customer.email,
              ]);
              console.log(`[Stripe Webhook] Subscription updated to ${plan} for ${customer.email}`);
            }
          }
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Stripe Webhook Handler Failed]:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
