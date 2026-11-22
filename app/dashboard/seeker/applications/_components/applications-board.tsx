/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/applications/_components/applications-board.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Seeker "My Applications" board matching Figma `Seeker / My Applications`:
 *     - Active / Archived tabs + Search bar + Export CSV button
 *     - 4-cell Stats Bento (Total Applied, Shortlisted, Interviews, Success Rate)
 *     - Applications table with live Archive/Restore (`PATCH /applications/:id`)
 *       and Withdraw (`DELETE /applications/:id`) actions!
 * ==============================================================================
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Archive, Download, RotateCcw, Search, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/shared/status-pill"
import { formatRelativeTime } from "@/lib/formatters"
import { type ApplicationRow, type ApplicationStatus } from "@/lib/types/applications"
import { deleteApplication, toggleArchiveApplication } from "@/lib/actions/applications"
import { toast } from "@/components/ui/toast"

const cardShadow =
  "shadow-[0_1px_2px_rgba(0,0,0,0.35)] shadow-[inset_0_1px_rgba(255,255,255,0.035)]"

const AVATAR_TILES = [
  { bg: "#222228", fg: "#EDEDEF" },
  { bg: "#474746", fg: "#EDEDEF" },
  { bg: "#C6C6C7", fg: "#2F3131" },
]

const headerCellClass = "px-3 py-3 text-[12px] font-medium text-[#6E6E78]"

const stats = [
  { label: "Total Applied", tone: "text-[#EDEDEF]" },
  { label: "Shortlisted", tone: "text-[#EDEDEF]" },
  { label: "Interviews", tone: "text-[#F59E0B]" },
  { label: "Success Rate", tone: "text-[#22C55E]" },
]

type Tab = "active" | "archived"

export function ApplicationsBoard({
  applications: initialApplications,
}: {
  applications: readonly ApplicationRow[]
}) {
  const [applications, setApplications] = useState<ApplicationRow[]>([...initialApplications])
  const [tab, setTab] = useState<Tab>("active")
  const [search, setSearch] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const q = search.trim().toLowerCase()
  const rows = applications.filter((app) => {
    const matchesTab = tab === "active" ? !app.archived : Boolean(app.archived)
    if (!matchesTab) return false
    if (!q) return true
    return (
      app.jobTitle.toLowerCase().includes(q) ||
      app.companyName.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    )
  })

  const count = (status: ApplicationStatus) =>
    applications.filter((app) => app.status === status).length

  const statValues = [
    String(applications.length),
    String(count("shortlisted")),
    String(count("interview")),
    `${Math.round((count("offered") / Math.max(applications.length, 1)) * 100)}%`,
  ]

  const handleToggleArchive = async (app: ApplicationRow) => {
    setBusyId(app._id)
    const nextArchived = !app.archived
    try {
      const res = await toggleArchiveApplication(app._id, nextArchived)
      if (res?.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === app._id ? { ...a, archived: nextArchived } : a))
        )
        toast.add({
          title: nextArchived ? "Archived" : "Restored",
          description: `${app.jobTitle} moved to ${nextArchived ? "Archived" : "Active"}.`,
        })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleWithdraw = async (app: ApplicationRow) => {
    if (!window.confirm(`Withdraw your application for "${app.jobTitle}"?`)) return
    setBusyId(app._id)
    try {
      const res = await deleteApplication(app._id)
      if (res?.success) {
        setApplications((prev) => prev.filter((a) => a._id !== app._id))
        toast.add({
          title: "Application withdrawn",
          description: `Removed application for ${app.jobTitle}.`,
        })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleExportCsv = () => {
    const csvRows = [
      ["Job Title", "Company", "Type", "Applied At", "Status"],
      ...rows.map((a) => [
        `"${a.jobTitle}"`,
        `"${a.companyName}"`,
        a.jobType,
        new Date(a.appliedAt).toLocaleDateString("en-US"),
        a.status,
      ]),
    ]
    const csv = csvRows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "hireloop-my-applications.csv"
    link.click()
    URL.revokeObjectURL(url)
    toast.add({ title: "Exported", description: "Applications downloaded as CSV." })
  }

  return (
    <div>
      {/* Top Search Bar */}
      <div className="mb-6 relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#828997]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applications..."
          className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
        />
      </div>

      {/* Page Header + Active/Archived Toggle + Export */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            My Applications
          </h1>
          <p className="mt-1 text-[13px] text-[#A0A0AB]">
            Track your job applications and interview progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="tablist"
            aria-label="Filter applications"
            className="flex rounded-md border border-white/10 bg-[#1A1A1F] p-[4px]"
          >
            {(["active", "archived"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "h-8 rounded-[4px] px-4 text-[13px] transition-colors",
                  tab === value
                    ? "bg-[#232327] font-medium text-[#EDEDEF]"
                    : "text-[#A0A0AB] hover:text-[#EDEDEF]"
                )}
              >
                {value === "active" ? "Active" : "Archived"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className={cn(
              "flex h-10 items-center gap-2 rounded-md bg-[#FAFAFA] px-4 text-[13px] font-medium text-[#0B0B0C]",
              cardShadow,
              "transition-colors hover:bg-white"
            )}
          >
            <Download aria-hidden className="size-3.5" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Stats Bento */}
      <dl className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map(({ label, tone }, index) => (
          <div
            key={label}
            className={cn("rounded-xl border border-white/10 bg-[#141418] px-6 py-4", cardShadow)}
          >
            <dt className="text-[13px] text-[#A0A0AB]">{label}</dt>
            <dd className={cn("mt-2.5 text-[26px] leading-8 font-semibold", tone)}>
              {statValues[index]}
            </dd>
          </div>
        ))}
      </dl>

      {/* Applications Table */}
      <section
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#141418]",
          cardShadow
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-[#1A1A1F]">
                <th scope="col" className={cn(headerCellClass, "pl-5")}>
                  Job Title
                </th>
                <th scope="col" className={headerCellClass}>
                  Company
                </th>
                <th scope="col" className={headerCellClass}>
                  Applied
                </th>
                <th scope="col" className={headerCellClass}>
                  Status
                </th>
                <th scope="col" className={cn(headerCellClass, "pr-5 text-right")}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((app, index) => {
                const tile = AVATAR_TILES[index % AVATAR_TILES.length]
                return (
                  <tr key={app._id} className="h-16 border-t border-white/10 hover:bg-white/[0.02]">
                    <td className="pl-5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex size-8 shrink-0 items-center justify-center rounded-[4px] text-[13px] font-medium"
                          style={{ backgroundColor: tile.bg, color: tile.fg }}
                        >
                          {app.companyName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-[#EDEDEF]">
                            {app.jobTitle}
                          </p>
                          <p className="truncate text-xs capitalize text-[#A0A0AB]">
                            {app.jobType} &bull; {app.isRemote ? "Remote" : "On-site"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="truncate pr-3 text-[13px] text-[#EDEDEF]">
                      {app.companyName}
                    </td>
                    <td className="pr-3 text-[13px] text-[#A0A0AB]">
                      {formatRelativeTime(app.appliedAt)}
                    </td>
                    <td className="pr-3">
                      <StatusPill status={app.status} />
                    </td>
                    <td className="pr-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/browse-jobs/${app.jobId}`}
                          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-[#EDEDEF] hover:border-white/25"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          disabled={busyId === app._id}
                          onClick={() => handleToggleArchive(app)}
                          title={app.archived ? "Restore to Active" : "Archive"}
                          className="rounded-md p-1.5 text-[#A0A0AB] hover:bg-white/10 hover:text-white"
                        >
                          {app.archived ? (
                            <RotateCcw className="size-3.5" />
                          ) : (
                            <Archive className="size-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === app._id}
                          onClick={() => handleWithdraw(app)}
                          title="Withdraw application"
                          className="rounded-md p-1.5 text-[#A0A0AB] hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-[#A0A0AB]">
                    No {tab} applications yet.{" "}
                    <Link href="/dashboard/seeker/jobs" className="text-[#8F88FF] underline">
                      Browse available jobs
                    </Link>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 text-xs text-[#A0A0AB]">
          <p>
            Showing {rows.length} of {applications.length} applications
          </p>
        </div>
      </section>
    </div>
  )
}
