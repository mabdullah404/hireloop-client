/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/billing/_components/billing-client.tsx
 * ==============================================================================
 * PURPOSE:
 *   Client UI for Figma's `Seeker / Billing & Subscription` screen:
 *     - Search filter for invoices
 *     - Bento row: Current Plan Card (left) + Stripe VISA Card (right, using Figma assets)
 *     - Billing History table with Export CSV button
 *     - Need help with your invoice? Support CTA
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Download, HelpCircle, Search } from "lucide-react"

import type { UserProfileData } from "@/lib/api/user"
import type { PaymentRow } from "@/lib/types/payments"
import { toast } from "@/components/ui/toast"

const PLAN_LABELS: Record<string, { title: string; price: string }> = {
  starter: { title: "Starter Tier", price: "$0" },
  growth: { title: "Growth Tier", price: "$17" },
  pro: { title: "Professional Tier", price: "$20" },
  premium: { title: "Premium Tier", price: "$99" },
}

export function BillingClient({
  profile,
  payments,
}: {
  profile: UserProfileData | null
  payments: PaymentRow[]
}) {
  const [query, setQuery] = React.useState("")

  const planKey = (profile?.plan || (profile?.premium ? "pro" : "starter")).toLowerCase()
  const planMeta = PLAN_LABELS[planKey] || PLAN_LABELS.starter

  const filteredPayments = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return payments
    return payments.filter(
      (p) =>
        (p.planName || "").toLowerCase().includes(q) ||
        (p.transactionId || p.sessionId || "").toLowerCase().includes(q)
    )
  }, [payments, query])

  const handleExportCsv = () => {
    const rows = [
      ["Date", "Plan", "Amount", "Transaction ID", "Status"],
      ...filteredPayments.map((p) => [
        new Date(p.payment_date).toLocaleDateString("en-US"),
        p.planName,
        `$${Number(p.amount || 0).toFixed(2)}`,
        p.transactionId || p.sessionId,
        p.status,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hireloop-billing-history.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ title: "Exported", description: "Billing history downloaded as CSV." })
  }

  return (
    <div className="space-y-8">
      {/* Top Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#A0A0AB]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices or plans..."
          className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none placeholder:text-[#A0A0AB] focus:border-[#5C53FE]"
        />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
          Subscription &amp; Billing
        </h1>
        <p className="mt-1 text-sm text-[#A0A0AB]">
          Manage your professional tier features, recurring payments, and billing history.
        </p>
      </div>

      {/* Bento Layout: Current Plan + Stripe Card */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Current Plan Card */}
        <section className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141418] p-6 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                  Current Plan
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#EDEDEF]">
                  {planMeta.title}
                </h2>
                <p className="mt-1 text-xs text-[#A0A0AB]">
                  Unlock global job insights and unlimited applications.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-[#EDEDEF]">
                  {planMeta.price}
                  <span className="text-sm font-normal text-[#A0A0AB]">/mo</span>
                </p>
                <p className="mt-1 text-xs text-[#22C55E]">
                  {profile?.premium ? "Active Subscription" : "Free Account"}
                </p>
              </div>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                "Unlimited Applications",
                "Premium Job Insights",
                "Priority Candidate Badge",
                "Direct Recruiter Messaging",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-xs text-[#EDEDEF]">
                  <Check className="size-4 text-[#8F88FF]" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/checkout?plan=pro"
              className="inline-flex h-10 items-center rounded-lg bg-[#FAFAFA] px-5 text-xs font-semibold text-[#0B0B0C] hover:bg-white"
            >
              Upgrade Plan
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-[#1B1B20] px-5 text-xs font-medium text-[#EDEDEF] hover:border-white/30"
            >
              Compare Plans
            </Link>
          </div>
        </section>

        {/* Payment Method Visual Card (Figma) */}
        <section className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141418] p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#EDEDEF]">Payment Method</h2>
            <span className="text-[10px] font-medium tracking-wider text-[#6E6E78] uppercase">
              Secure by Stripe
            </span>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-xl border border-white/15 p-5">
            <Image
              src="/images/card-bg.png"
              alt=""
              aria-hidden
              fill
              className="object-cover opacity-80"
            />
            <div className="relative z-10 flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between">
                <Image
                  src="/images/card-chip.png"
                  alt="Card chip"
                  width={38}
                  height={28}
                  className="rounded"
                />
                <span className="text-sm font-bold tracking-widest text-white">VISA</span>
              </div>

              <p className="font-mono text-lg tracking-[0.2em] text-white">
                &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
              </p>

              <div className="flex items-end justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase text-white/70">Card Holder</p>
                  <p className="mt-0.5 font-medium uppercase text-white">
                    {profile?.name || "HireLoop Member"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-white/70">Expires</p>
                  <p className="mt-0.5 font-medium text-white">12/28</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/checkout?plan=pro"
            className="mt-4 block text-center text-xs font-medium text-[#A0A0AB] hover:text-white"
          >
            + Add or Update Payment Method
          </Link>
        </section>
      </div>

      {/* Billing History Table */}
      <section className="rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-center justify-between gap-4 pb-4">
          <h2 className="text-xl font-semibold text-[#EDEDEF]">Billing History</h2>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#1B1B20] px-3.5 text-xs font-medium text-[#EDEDEF] hover:border-white/25"
          >
            <Download className="size-3.5" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-white/10 text-xs text-[#6E6E78]">
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Plan</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Transaction ID</th>
                <th className="py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredPayments.map((p) => (
                <tr key={p._id}>
                  <td className="py-3.5 text-[#EDEDEF]">
                    {new Date(p.payment_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 text-[#EDEDEF]">{p.planName}</td>
                  <td className="py-3.5 font-medium text-[#EDEDEF]">
                    ${Number(p.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 font-mono text-xs text-[#A0A0AB]">
                    {p.transactionId || p.sessionId}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-medium capitalize text-[#22C55E]">
                      {p.status || "Paid"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#A0A0AB]">
                    No invoices yet. Upgrade to a Pro plan to unlock billing receipts here.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Support CTA */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 size-5 text-[#8F88FF]" />
          <div>
            <h3 className="text-base font-semibold text-[#EDEDEF]">
              Need help with your invoice?
            </h3>
            <p className="mt-1 text-xs text-[#A0A0AB]">
              Our support team is available 24/7 to help you resolve any payment issues or
              clarify billing details.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@hireloop.com"
          className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-[#1B1B20] px-4 text-xs font-medium text-white hover:border-white/30"
        >
          Contact Support
        </a>
      </section>
    </div>
  )
}
