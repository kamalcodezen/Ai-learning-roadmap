import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";
import { stripe } from "@/src/lib/stripe";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const headersList = await headers();
    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Find customer by email in Stripe
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      });
      customerId = newCustomer.id;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/learner/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create customer portal session";
    console.error("[Stripe Portal Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
