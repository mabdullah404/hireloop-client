/**
 * ==============================================================================
 * FILE: client/app/api/checkout_sessions/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Creates a Stripe Checkout Session when `STRIPE_SECRET_KEY` is configured in `.env.local`.
 *   If no Stripe key is set, returns a helpful JSON message so the Checkout page
 *   uses our built-in Sandbox Checkout flow (`POST http://localhost:5000/payments/checkout-sandbox`).
 *
 * CALLED FROM FRONTEND:
 *   - `client/app/checkout/_components/checkout-client.tsx` (optional live Stripe mode)
 * ==============================================================================
 */

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getStripe } from "@/lib/stripe"
import { getSession } from "@/lib/core/server"

export async function POST(request: Request) {
  const userSession = await getSession()
  const stripe = getStripe()

  if (!stripe) {
    return NextResponse.json(
      {
        sandbox: true,
        message: "STRIPE_SECRET_KEY not configured; use Sandbox Checkout mode.",
      },
      { status: 400 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const planName = String(body.planName || "Hireloop Pro Plan")
    const plan = String(body.plan || "pro")
    const amountUsd = Number(body.amount || 20)

    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.BETTER_AUTH_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planName,
              description: "HireLoop Premium Subscription Access",
            },
            unit_amount: Math.round(amountUsd * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userSession?.user.email,
      metadata: {
        userId: userSession?.user.id ?? "",
        plan,
        planName,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
