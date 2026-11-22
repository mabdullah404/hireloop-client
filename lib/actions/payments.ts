/**
 * ==============================================================================
 * FILE: client/lib/actions/payments.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for Checkout payment processing & session verification.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - POST http://localhost:5001/payments/checkout-sandbox -> processSandboxCheckout() [Auth]
 *   - POST http://localhost:5001/payments/checkout-verify  -> verifyPaymentSession()   [Public]
 *
 * USED BY:
 *   - `client/app/checkout/_components/checkout-client.tsx`
 *   - `client/app/checkout/success/page.tsx`
 * ==============================================================================
 */

"use server"

import { protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

export type SandboxCheckoutInput = {
  plan: string
  planName: string
  amount: number
  currency: "USD" | "BDT"
  billingCycle: "monthly" | "yearly"
  cardLast4: string
  cardholderName: string
}

/**
 * Calls `POST /payments/checkout-sandbox` (Logged-in user).
 * Processes a Sandbox payment, inserts a transaction in MongoDB `payments`,
 * upgrades the user to `premium: true`, and returns `{ success, sessionId }`.
 */
export const processSandboxCheckout = async (payload: SandboxCheckoutInput) => {
  const res = await protectedMutation(`${BASE_URL}/payments/checkout-sandbox`, "POST", payload)
  return res.json()
}

/**
 * Calls `POST /payments/checkout-verify` to confirm a Stripe OR Sandbox `session_id`
 * when the user lands on `/checkout/success?session_id=...`.
 */
export const verifyPaymentSession = async (sessionId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/payments/checkout-verify`, {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    return res.json()
  } catch {
    return { success: false, message: "Could not reach payment server" }
  }
}
