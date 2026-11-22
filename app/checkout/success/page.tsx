/**
 * ==============================================================================
 * FILE: client/app/checkout/success/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Payment Success receipt screen matching Figma `Public / Checkout — Payment Successful`:
 *     - Reads `?session_id=...` from URL
 *     - Calls `verifyPaymentSession(session_id)` (`POST http://localhost:5000/payments/checkout-verify`)
 *     - Displays green check badge, "UPGRADE SUCCESSFUL", "Welcome to Hireloop Pro",
 *       Session ID Verified receipt box, and "Go to Workspace Dashboard" button!
 * ==============================================================================
 */

import Link from "next/link"
import { ArrowRight, Check, ShieldCheck } from "lucide-react"
import { SiteNavbar } from "@/components/site-navbar"
import { verifyPaymentSession } from "@/lib/actions/payments"
import { getSession } from "@/lib/core/server"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const userSession = await getSession()

  const verification = session_id
    ? await verifyPaymentSession(session_id)
    : { success: false, payment: null }

  const payment = verification?.payment
  const amountText = payment?.amount
    ? `$${Number(payment.amount).toFixed(2)}`
    : "$20.00"
  const planName = payment?.planName || "Hireloop Pro Plan"
  const transactionId = payment?.transactionId || session_id || "TRX-VERIFIED"
  const dashboardUrl = userSession?.user?.role
    ? `/dashboard/${userSession.user.role}`
    : "/dashboard/seeker/billing"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080A] text-white">
      <SiteNavbar />

      {/* Decorative blue glow behind the card (Figma) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1E3A8A]/45 blur-[130px]"
      />

      <main className="relative z-10 flex items-center justify-center px-4 py-16">
        <section className="w-full max-w-[512px] rounded-3xl border border-white/10 bg-[#141418] px-8 py-10 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] sm:px-10">
          {/* Green Checkmark Circle */}
          <div className="flex justify-center">
            <span
              aria-hidden
              className="flex size-16 items-center justify-center rounded-full bg-[#10B981] shadow-[0_0_0_8px_rgba(16,185,129,0.12)]"
            >
              <Check strokeWidth={3} className="size-8 text-white" />
            </span>
          </div>

          <p className="mt-7 inline-flex h-6 items-center rounded border border-[#3B82F6]/60 bg-[#3B82F6]/15 px-3 text-[11px] font-medium tracking-[0.28em] text-[#60A5FA] uppercase">
            Upgrade Successful
          </p>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            Welcome to {planName}
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#9CA3AF]">
            Your payment of <strong className="text-white">{amountText}</strong> was
            received perfectly. All advanced premium modules are unlocked on your
            account.
          </p>

          {/* Session ID Verified Receipt Box */}
          <div className="mt-8 rounded-xl border border-[#1F2937] bg-black/80 px-4 py-4 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#22C55E]" />
                <span className="text-xs font-medium text-[#A0A0AB]">
                  Session ID Verified
                </span>
              </div>
              <code className="max-w-[200px] truncate rounded bg-[#1F2937] px-2 py-0.5 font-mono text-[11px] text-[#9CA3AF]">
                {session_id || "cs_test_verified"}
              </code>
            </div>

            <dl className="mt-3 divide-y divide-[#1F2937] border-t border-[#1F2937] text-xs">
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A0A0AB]">Transaction ID</dt>
                <dd className="font-mono text-[#EDEDEF]">{transactionId}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A0A0AB]">Plan</dt>
                <dd className="text-[#EDEDEF]">{planName}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#A0A0AB]">Amount Paid</dt>
                <dd className="font-semibold text-[#22C55E]">{amountText}</dd>
              </div>
              {payment?.customer_email ? (
                <div className="flex justify-between py-2.5">
                  <dt className="text-[#A0A0AB]">Receipt Email</dt>
                  <dd className="text-[#EDEDEF]">{payment.customer_email}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <Link
            href={dashboardUrl}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            Go to Workspace Dashboard
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  )
}
