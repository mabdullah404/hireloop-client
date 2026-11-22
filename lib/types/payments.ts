/**
 * ==============================================================================
 * FILE: client/lib/types/payments.ts
 * ==============================================================================
 * PURPOSE:
 *   TypeScript types and subscription plan catalog shared across:
 *     - Homepage Pricing section (`client/components/pricing-section.tsx`)
 *     - Public Checkout page (`client/app/checkout/page.tsx`)
 *     - Seeker Billing page (`client/app/dashboard/seeker/billing/page.tsx`)
 *     - Admin Payments page (`client/app/dashboard/admin/payments/page.tsx`)
 * ==============================================================================
 */

export type PaymentStatus = "paid" | "pending" | "failed"

export type PaymentRow = {
  _id: string
  sessionId: string
  transactionId?: string
  userId: string
  userName?: string
  customer_email: string
  plan: string
  planName: string
  billingCycle?: string
  amount: number
  currency?: string
  cardLast4?: string
  cardholderName?: string
  status: PaymentStatus
  payment_status?: string
  payment_date: string
}

export type PlanDefinition = {
  id: "starter" | "growth" | "pro" | "premium"
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  highlighted?: boolean
  features: string[]
}

// Pricing plans matching Figma's Homepage Pricing & Checkout screens
export const PRICING_PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Start building your insights hub:",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Start building your insights hub:",
    monthlyPrice: 17,
    yearlyPrice: 13,
    highlighted: true,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Start building your insights hub:",
    monthlyPrice: 99,
    yearlyPrice: 74,
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
  },
]

export const PRO_CHECKOUT_PLAN: PlanDefinition = {
  id: "pro",
  name: "Hireloop Pro Plan",
  tagline: "Unlock global job insights and unlimited applications.",
  monthlyPrice: 20,
  yearlyPrice: 15,
  features: [
    "Unlimited Applications",
    "Premium Job Insights",
    "Priority Candidate Badge",
    "Direct Recruiter Messaging",
  ],
}
