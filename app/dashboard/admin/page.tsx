/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Admin Dashboard Overview matching Figma `Admin / Dashboard Overview`:
 *     - 5-Card Platform KPI Row:
 *         1. Total Users
 *         2. Total Recruiters
 *         3. Total Companies
 *         4. Jobs Posted
 *         5. Platform Revenue
 *     - Recent Subscription Transactions table with quick links to all Admin consoles
 *
 * API CALLS MADE HERE:
 *   - `getAdminStats()` -> `GET http://localhost:5000/dashboard/admin/stats`
 * ==============================================================================
 */

import Link from "next/link"
import { Briefcase, Building2, DollarSign, UserCheck, Users } from "lucide-react"

import { PageContainer } from "@/components/dashboard/page-shell"
import { getAdminStats } from "@/lib/api/dashboard"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const kpis = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      trend: "Live DB",
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      label: "Total Recruiters",
      value: stats.totalRecruiters.toLocaleString(),
      trend: "Active roles",
      icon: UserCheck,
      href: "/dashboard/admin/users",
    },
    {
      label: "Total Companies",
      value: stats.totalCompanies.toLocaleString(),
      trend: "Verified & listed",
      icon: Building2,
      href: "/dashboard/admin/companies",
    },
    {
      label: "Jobs Posted",
      value: stats.jobsPosted.toLocaleString(),
      trend: `${stats.activeJobs} active`,
      icon: Briefcase,
      href: "/dashboard/admin/jobs",
    },
    {
      label: "Platform Revenue",
      value: `$${stats.platformRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
      trend: `$${stats.monthlyRevenue.toLocaleString()} / 30d`,
      icon: DollarSign,
      href: "/dashboard/admin/payments",
    },
  ]

  return (
    <PageContainer width="wide">
      {/* Header Section matching Figma Admin / Dashboard Overview */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="overline-label">Admin Console</p>
          <h1 className="page-title mt-1">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-[#A0A0AB]">
            Real-time platform performance, user access, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/settings"
            className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-[#141418] px-4 text-xs font-medium text-[#EDEDEF] hover:border-white/25"
          >
            Seed Demo Data
          </Link>
          <Link
            href="/dashboard/admin/payments"
            className="inline-flex h-10 items-center rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C] hover:bg-white"
          >
            View All Payments
          </Link>
        </div>
      </div>

      {/* 5-Card Stats Row */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map(({ label, value, trend, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-white/10 bg-[#141418] p-5 transition-colors hover:border-[#5C53FE]/50"
          >
            <div className="flex items-center justify-between">
              <Icon className="size-4 text-[#8F88FF]" />
              <span className="text-[11px] font-medium text-[#22C55E]">{trend}</span>
            </div>
            <dt className="mt-4 text-xs text-[#A0A0AB]">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-[#EDEDEF]">{value}</dd>
          </Link>
        ))}
      </dl>

      {/* Recent Subscription Transactions Table */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-[#EDEDEF]">
            Recent Subscription Transactions
          </h2>
          <Link
            href="/dashboard/admin/payments"
            className="text-xs font-medium text-[#8F88FF] hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                <th className="py-3">User / Recruiter</th>
                <th className="py-3">Plan Type</th>
                <th className="py-3">Transaction ID</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {stats.recentTransactions.map((tx) => {
                const status = tx.status || "paid"
                return (
                  <tr key={tx._id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5">
                      <p className="font-medium text-[#EDEDEF]">{tx.customer_email}</p>
                      {tx.userName ? (
                        <p className="text-xs text-[#A0A0AB]">{tx.userName}</p>
                      ) : null}
                    </td>
                    <td className="py-3.5 text-xs text-[#EDEDEF]">{tx.planName}</td>
                    <td className="py-3.5 font-mono text-xs text-[#A0A0AB]">
                      {tx.transactionId || tx.sessionId}
                    </td>
                    <td className="py-3.5 font-medium text-[#EDEDEF]">
                      ${Number(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-xs text-[#A0A0AB]">
                      {new Date(tx.payment_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          status === "paid"
                            ? "bg-[#22C55E]/15 text-[#22C55E]"
                            : status === "pending"
                            ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                            : "bg-red-500/15 text-red-400"
                        )}
                      >
                        {status === "paid" ? "Success" : status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {stats.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#A0A0AB]">
                    No transactions recorded yet. Complete a Sandbox checkout or seed demo
                    data in Admin Settings.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
