/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/billing/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Seeker Subscription & Billing page matching Figma `Seeker / Billing & Subscription`:
 *     - Current Plan bento card with live tier, features checklist & Upgrade CTA
 *     - Stripe Payment Method card (with Figma's swirl background & gold chip!)
 *     - Billing History table loaded from Express `GET /payments/my`
 *     - Bottom 24/7 Support CTA card
 *
 * API CALLS MADE HERE:
 *   - `getMyProfile()`  -> `GET http://localhost:5000/users/me`
 *   - `getMyPayments()` -> `GET http://localhost:5000/payments/my`
 * ==============================================================================
 */

import { PageContainer } from "@/components/dashboard/page-shell"
import { getMyProfile } from "@/lib/api/user"
import { getMyPayments } from "@/lib/api/payments"
import { BillingClient } from "./_components/billing-client"

export default async function SeekerBillingPage() {
  const [profile, payments] = await Promise.all([getMyProfile(), getMyPayments()])

  return (
    <PageContainer width="wide">
      <BillingClient profile={profile} payments={payments} />
    </PageContainer>
  )
}
