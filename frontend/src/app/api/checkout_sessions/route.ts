import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import { stripe } from '../../../lib/stripe'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = new URL(req.url).searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
      sessionId,
      { expand: ['line_items'] }
    )

    const lineItem = session.line_items?.data?.[0]

    return NextResponse.json({
      sessionId: session.id,
      status: session.payment_status,
      customerEmail:
        session.customer_details?.email ?? (session.customer_email as string | null) ?? null,
      planName: lineItem?.description ?? null,
      interval: lineItem?.price?.recurring?.interval ?? null,
      amountTotal: session.amount_total,
      currency: session.currency,
      subscriptionId: session.subscription,
      metadata: session.metadata ?? null,
    })
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode ?? 500 }
      )
    }

    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const priceId = formData.get('priceId') as string

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
    }

    const headersList = await headers()
    const origin = headersList.get('origin') ?? ''

    const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/success?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(session.url, 303)
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode ?? 500 }
      )
    }

    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}