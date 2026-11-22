/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/payments/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Admin Payments & Subscriptions page matching Figma `Admin / Payments & Subscriptions`:
 *     - 4-Card Key Metrics Bento: Total Revenue, Monthly Revenue, Active Pro Users, Active Enterprise Users
 *     - Recent Transactions Table with Filter, Search, Export CSV, and inline Status controls
 *
 * API CALLS MADE HERE:
 *   - `getAllPayments()`      -> `GET http://localhost:5000/payments`
 *   - `getUsers()`            -> `GET http://localhost:5000/users`
 *   - `updatePaymentStatus()` -> `PATCH http://localhost:5000/payments/:id`
 * ==============================================================================
 */

import { PageContainer } from "@/components/dashboard/page-shell"
import { getAllPayments } from "@/lib/api/payments"
import { getUsers } from "@/lib/api/user"
import { AdminPaymentsTable } from "./_components/admin-payments-table"

export default async function AdminPaymentsPage() {
  const [payments, users] = await Promise.all([getAllPayments(), getUsers()])
  const userList = Array.isArray(users) ? users : []

  const activeProCount = userList.filter(
    (u: { premium?: boolean; plan?: string }) =>
      u.premium && u.plan !== "premium"
  ).length
  const activeEnterpriseCount = userList.filter(
    (u: { plan?: string }) => u.plan === "premium"
  ).length

  return (
    <PageContainer width="wide">
      <AdminPaymentsTable
        initialPayments={payments}
        activeProUsers={activeProCount}
        activeEnterpriseUsers={activeEnterpriseCount}
      />
    </PageContainer>
  )
}
