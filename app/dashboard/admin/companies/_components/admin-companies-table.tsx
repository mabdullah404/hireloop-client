/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/companies/_components/admin-companies-table.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Admin table to verify/unverify or delete companies in MongoDB.
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { BadgeCheck, Search, Trash2 } from "lucide-react"

import type { CompanyRow } from "@/lib/types/companies"
import { deleteCompany, toggleVerifyCompany } from "@/lib/api/companies"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function AdminCompaniesTable({
  initialCompanies,
}: {
  initialCompanies: CompanyRow[]
}) {
  const [companies, setCompanies] = React.useState(initialCompanies)
  const [search, setSearch] = React.useState("")
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const filtered = companies.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry || "").toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q)
    )
  })

  const handleToggleVerify = async (company: CompanyRow) => {
    setBusyId(company._id)
    try {
      const next = !company.verified
      const res = await toggleVerifyCompany(company._id, next)
      if (res?.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === company._id ? { ...c, verified: next } : c))
        )
        toast.add({
          title: next ? "Company verified" : "Verification removed",
          description: `${company.name} status updated.`,
        })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (company: CompanyRow) => {
    if (!window.confirm(`Delete company ${company.name}?`)) return
    setBusyId(company._id)
    try {
      const res = await deleteCompany(company._id)
      if (res?.success) {
        setCompanies((prev) => prev.filter((c) => c._id !== company._id))
        toast.add({ title: "Company deleted", description: `${company.name} removed.` })
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#A0A0AB]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies or industries..."
          className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#141418]">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Industry</th>
              <th className="px-5 py-3.5">Size</th>
              <th className="px-5 py-3.5">Open Jobs</th>
              <th className="px-5 py-3.5">Verification</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filtered.map((company) => (
              <tr key={company._id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-[#EDEDEF]">{company.name}</p>
                  <p className="text-xs text-[#A0A0AB]">{company.location}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#A0A0AB]">{company.industry}</td>
                <td className="px-5 py-3.5 text-xs text-[#A0A0AB]">{company.size}</td>
                <td className="px-5 py-3.5 text-xs font-medium text-[#EDEDEF]">
                  {company.openJobs ?? 0} active / {company.totalJobs ?? 0} total
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      company.verified
                        ? "bg-[#22C55E]/15 text-[#22C55E]"
                        : "bg-white/10 text-[#A0A0AB]"
                    )}
                  >
                    <BadgeCheck className="size-3.5" />
                    {company.verified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === company._id}
                      onClick={() => handleToggleVerify(company)}
                      className="rounded-md border border-white/15 bg-[#1B1B20] px-3 py-1.5 text-xs font-medium text-white hover:border-white/30"
                    >
                      {company.verified ? "Revoke Badge" : "Verify"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === company._id}
                      onClick={() => handleDelete(company)}
                      aria-label={`Delete ${company.name}`}
                      className="rounded-md p-1.5 text-[#A0A0AB] hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#A0A0AB]">
                  No companies found. Seed demo data in Admin Settings or wait for recruiters to
                  save their company profiles.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
