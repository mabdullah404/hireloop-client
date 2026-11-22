/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/payments/_components/admin-payments-table.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Admin Revenue & Transactions dashboard matching Figma
 *   `Admin / Payments & Subscriptions`.
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { Download, Search } from "lucide-react"

import type { PaymentRow, PaymentStatus } from "@/lib/types/payments"
import { updatePaymentStatus } from "@/lib/api/payments"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function AdminPaymentsTable({
  initialPayments,
  activeProUsers,
  activeEnterpriseUsers,
}: {
  initialPayments: PaymentRow[]
  activeProUsers: number
  activeEnterpriseUsers: number
}) {
  const [payments, setPayments] = React.useState(initialPayments)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | PaymentStatus>("all")
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [now] = React.useState(() => Date.now())

  const { totalRevenue, monthlyRevenue } = React.useMemo(() => {
    const total = payments
      .filter((p) => p.status === "paid" || p.payment_status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const monthly = payments
      .filter(
        (p) =>
          (p.status === "paid" || p.payment_status === "paid") &&
          new Date(p.payment_date).getTime() >= thirtyDaysAgo
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return { totalRevenue: total, monthlyRevenue: monthly }
  }, [payments, now])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false
      if (!q) return true
      return (
        (p.customer_email || "").toLowerCase().includes(q) ||
        (p.transactionId || p.sessionId || "").toLowerCase().includes(q) ||
        (p.planName || "").toLowerCase().includes(q)
      )
    })
  }, [payments, search, statusFilter])

  const handleStatusChange = async (paymentId: string, nextStatus: PaymentStatus) => {
    setBusyId(paymentId)
    try {
      const res = await updatePaymentStatus(paymentId, nextStatus)
      if (res?.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId
              ? { ...p, status: nextStatus, payment_status: nextStatus }
              : p
          )
        )
        toast.add({
          title: "Payment updated",
          description: `Transaction marked as ${nextStatus}.`,
        })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleExportCsv = () => {
    const rows = [
      ["User Email", "Plan", "Amount", "Date", "Transaction ID", "Status"],
      ...filtered.map((p) => [
        p.customer_email,
        p.planName,
        `$${Number(p.amount || 0).toFixed(2)}`,
        new Date(p.payment_date).toLocaleDateString("en-US"),
        p.transactionId || p.sessionId,
        p.status,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hireloop-payments.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      delta: "+12.4%",
      color: "text-[#22C55E]",
    },
    {
      label: "Monthly Revenue",
      value: `$${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      delta: "+8.1%",
      color: "text-[#22C55E]",
    },
    {
      label: "Active Pro Users",
      value: String(activeProUsers),
      delta: "Live",
      color: "text-[#F59E0B]",
    },
    {
      label: "Active Enterprise Users",
      value: String(activeEnterpriseUsers),
      delta: "Live",
      color: "text-[#22C55E]",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="overline-label">Admin View</p>
        <h1 className="page-title mt-1">Payments &amp; Subscriptions</h1>
        <p className="mt-1 text-sm text-[#A0A0AB]">
          Comprehensive overview of platform revenue and active subscriptions.
        </p>
      </div>

      {/* 4-Card Key Metrics Bento */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-white/10 bg-[#141418] p-5"
          >
            <div className="flex items-center justify-between">
              <dt className="text-xs text-[#A0A0AB]">{m.label}</dt>
              <span className={`text-xs font-medium ${m.color}`}>{m.delta}</span>
            </div>
            <dd className="mt-3 text-2xl font-semibold text-[#EDEDEF]">{m.value}</dd>
          </div>
        ))}
      </dl>

      {/* Recent Transactions Table */}
      <section className="rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h2 className="text-xl font-semibold text-[#EDEDEF]">Recent Transactions</h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#A0A0AB]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email or TXN..."
                className="h-9 rounded-lg border border-white/10 bg-[#0F0F12] pl-8 pr-3 text-xs text-white outline-none focus:border-[#5C53FE]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | PaymentStatus)}
              className="h-9 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-xs text-white outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid / Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-xs font-semibold text-[#0B0B0C] hover:bg-white"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                <th className="py-3">User Email</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Date</th>
                <th className="py-3">Transaction ID</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-medium text-[#EDEDEF]">{p.customer_email}</td>
                  <td className="py-3.5 text-xs text-[#A0A0AB]">{p.planName}</td>
                  <td className="py-3.5 font-medium text-[#EDEDEF]">
                    ${Number(p.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 text-xs text-[#A0A0AB]">
                    {new Date(p.payment_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 font-mono text-xs text-[#A0A0AB]">
                    {p.transactionId || p.sessionId}
                  </td>
                  <td className="py-3.5 text-right">
                    <select
                      disabled={busyId === p._id}
                      value={p.status || "paid"}
                      onChange={(e) =>
                        handleStatusChange(p._id, e.target.value as PaymentStatus)
                      }
                      className={cn(
                        "rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium outline-none",
                        p.status === "paid"
                          ? "bg-[#22C55E]/15 text-[#22C55E]"
                          : p.status === "pending"
                          ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                          : "bg-red-500/15 text-[#EF4444]"
                      )}
                    >
                      <option value="paid" className="bg-[#141418] text-white">
                        Success
                      </option>
                      <option value="pending" className="bg-[#141418] text-white">
                        Pending
                      </option>
                      <option value="failed" className="bg-[#141418] text-white">
                        Failed
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#A0A0AB]">
                    No transactions match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
