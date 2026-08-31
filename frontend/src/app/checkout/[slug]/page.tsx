import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CheckoutForm from "@/src/components/checkout/CheckoutForm";
import { pricingPlans } from "@/src/components/home/pricing/plans";

type BillingPeriod = "monthly" | "yearly";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ billing?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = pricingPlans.find((item) => item.slug === slug);

  return {
    title: plan ? `Checkout · ${plan.name} | AI Pather` : "Checkout | AI Pather",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const { billing: rawBilling } = await searchParams;

  const plan = pricingPlans.find((item) => item.slug === slug);
  if (!plan) notFound();

  const billingParam = Array.isArray(rawBilling) ? rawBilling[0] : rawBilling;
  const billing: BillingPeriod =
    billingParam === "yearly" ? "yearly" : "monthly";

  return <CheckoutForm plan={plan} billing={billing} />;
}