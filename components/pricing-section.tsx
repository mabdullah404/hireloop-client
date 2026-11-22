/**
 * ==============================================================================
 * FILE: client/components/pricing-section.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Pricing section directly matching Figma's `Design / Homepage`
 *   "Pricing" frame:
 *     - "Pay for the leverage, not the listings" heading
 *     - Monthly / Yearly (Save 25%) toggle pill
 *     - 3 plan cards: Starter ($0), Growth ($17 — highlighted), Premium ($99)
 *     - "Choose This Plan" buttons routing to `/checkout?plan=<id>&cycle=<monthly|yearly>`
 *       (Starter routes to `/sign-up`).
 *
 * USED BY:
 *   - `client/app/page.tsx` (Homepage)
 *   - `client/app/pricing/page.tsx` (Dedicated Pricing route)
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { PRICING_PLANS } from "@/lib/types/payments"

export function PricingSection() {
  // Track whether the user wants Monthly or Yearly (25% off) pricing
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly")

  return (
    <section id="pricing" className="relative overflow-hidden bg-[#010103] py-24 text-white">
      {/* Ambient purple glow matching Figma's Pricing background ellipse */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[540px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5C53FE]/15 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section overline pill + Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5">
            <Sparkles className="size-4 text-[#8F88FF]" />
            <span className="font-badge text-sm tracking-wide text-white/90">Pricing</span>
          </div>

          <h2 className="font-heading max-w-2xl text-3xl leading-[1.15] font-semibold tracking-[-0.02em] sm:text-5xl">
            Pay for the leverage, not the listings
          </h2>

          {/* Monthly / Yearly Toggle Pill */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#121216] p-1.5">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                billingCycle === "monthly"
                  ? "bg-white text-[#010103]"
                  : "text-white/75 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
                billingCycle === "yearly"
                  ? "bg-white text-[#010103]"
                  : "text-white/75 hover:text-white"
              )}
            >
              Yearly
              <span className="rounded-full bg-[#5C53FE] px-2 py-0.5 text-xs font-semibold text-white">
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Plan Cards Grid */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const price =
              billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
            const href =
              plan.id === "starter"
                ? "/sign-up"
                : `/checkout?plan=${plan.id}&cycle=${billingCycle}`

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl border p-8 transition-transform duration-200 hover:-translate-y-1",
                  plan.highlighted
                    ? "border-[#5C53FE]/70 bg-gradient-to-b from-[#1A1735] via-[#121218] to-[#0E0E12] shadow-[0_0_50px_rgba(92,83,254,0.2)]"
                    : "border-white/10 bg-[#101014]/95"
                )}
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#5C53FE] px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                ) : null}

                <div>
                  <h3 className="font-heading text-2xl font-medium text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-heading text-4xl font-semibold tracking-tight text-white">
                      ${price}
                    </span>
                    <span className="text-sm text-[#A1A4AA]">/month</span>
                  </div>

                  {billingCycle === "yearly" && price > 0 ? (
                    <p className="mt-1 text-xs text-[#8F88FF]">
                      Billed annually (${price * 12}/year)
                    </p>
                  ) : null}

                  <div className="my-6 h-px bg-white/10" />

                  <p className="text-sm font-medium text-white/90">{plan.tagline}</p>

                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-[#A1A4AA]"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-[#8F88FF]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={href}
                  className={cn(
                    "mt-8 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                    plan.highlighted
                      ? "bg-white text-[#010103] hover:bg-white/90"
                      : "border border-white/15 bg-white/[0.06] text-white hover:bg-[#5C53FE] hover:border-[#5C53FE]"
                  )}
                >
                  Choose This Plan
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
