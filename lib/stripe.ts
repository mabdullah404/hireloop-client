/**
 * ==============================================================================
 * FILE: client/lib/stripe.ts
 * ==============================================================================
 * PURPOSE:
 *   Lazily creates a Stripe SDK client ONLY when `STRIPE_SECRET_KEY` is provided
 *   in `client/.env.local`. When no Stripe key is set, `getStripe()` returns `null`
 *   so HireLoop automatically falls back to its built-in Sandbox Checkout flow!
 *
 * USED BY:
 *   - `client/app/api/checkout_sessions/route.ts`
 * ==============================================================================
 */

import "server-only"
import Stripe from "stripe"

let cachedStripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null
  if (!cachedStripe) {
    cachedStripe = new Stripe(secretKey)
  }
  return cachedStripe
}
