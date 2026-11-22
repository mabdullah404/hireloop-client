/**
 * ==============================================================================
 * FILE: client/app/checkout/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Checkout page matching Figma `Public / Checkout — Stripe Payment`:
 *     - Reads `?plan=growth|pro|premium&cycle=monthly|yearly` from URL
 *     - Reads logged-in user session on the server to prefill email/name
 *     - Renders `<CheckoutClient />` with SANDBOX badge, BDT/USD currency switcher,
 *       Order Summary, and Card Payment form!
 * ==============================================================================
 */

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/core/server"
import { PRICING_PLANS, PRO_CHECKOUT_PLAN } from "@/lib/types/payments"
import { CheckoutClient } from "./_components/checkout-client"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string; canceled?: string }>
}) {
  const { plan = "pro", cycle = "monthly", canceled } = await searchParams
  const session = await getSession()

  const selectedPlan =
    PRICING_PLANS.find((p) => p.id === plan && p.monthlyPrice > 0) || PRO_CHECKOUT_PLAN
  const billingCycle = cycle === "yearly" ? "yearly" : "monthly"
  const usdPrice =
    billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice

  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      {/* Figma Checkout Top Header with SANDBOX pill */}
      <header className="mx-auto flex h-24 w-full max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            aria-label="Back to pricing"
            className="text-[#A1A1AA] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <Link href="/" className="font-heading text-lg font-bold text-white">
            Hireloop
          </Link>
          <span className="rounded bg-[#1E2329] px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
            SANDBOX
          </span>
        </div>

        {!session?.user ? (
          <Link
            href={`/sign-in?redirectTo=/checkout?plan=${plan}&cycle=${billingCycle}`}
            className="text-xs font-medium text-[#8F88FF] hover:text-white"
          >
            Sign in first to link account
          </Link>
        ) : (
          <span className="text-xs text-[#A1A1AA]">Signed in as {session.user.email}</span>
        )}
      </header>

      {canceled ? (
        <div className="mx-auto mb-6 max-w-4xl px-4">
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Checkout was canceled. You can review your order and complete payment anytime.
          </p>
        </div>
      ) : null}

      <CheckoutClient
        planId={selectedPlan.id}
        planName={selectedPlan.name}
        planDescription={selectedPlan.tagline}
        usdAmount={usdPrice}
        billingCycle={billingCycle}
        userEmail={session?.user?.email || ""}
        userName={session?.user?.name || ""}
        isLoggedIn={Boolean(session?.user)}
      />
    </div>
  )
}
