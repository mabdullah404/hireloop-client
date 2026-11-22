/**
 * ==============================================================================
 * FILE: client/lib/api/payments.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for reading personal billing history (Seeker Billing)
 *   and platform-wide subscription transactions (Admin Payments).
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET   http://localhost:5001/payments/my   -> getMyPayments()         [Auth]
 *   - GET   http://localhost:5001/payments      -> getAllPayments()        [Admin]
 *   - PATCH http://localhost:5001/payments/:id  -> updatePaymentStatus()   [Admin]
 *
 * USED BY:
 *   - `client/app/dashboard/seeker/billing/page.tsx`
 *   - `client/app/dashboard/admin/payments/page.tsx`
 * ==============================================================================
 */

"use server"

import { authFetch, protectedMutation } from "@/lib/core/server"
import type { PaymentRow, PaymentStatus } from "@/lib/types/payments"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `GET /payments/my` (Logged-in user) for Seeker Billing History table.
 */
export const getMyPayments = async (): Promise<PaymentRow[]> => {
  try {
    const res = await authFetch(`${BASE_URL}/payments/my`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `GET /payments` (Admin only) to inspect all platform revenue transactions.
 */
export const getAllPayments = async (): Promise<PaymentRow[]> => {
  try {
    const res = await authFetch(`${BASE_URL}/payments`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `PATCH /payments/:id` (Admin only) to mark a transaction paid/pending/failed.
 */
export const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
  const res = await protectedMutation(`${BASE_URL}/payments/${paymentId}`, "PATCH", { status })
  return res.json()
}
