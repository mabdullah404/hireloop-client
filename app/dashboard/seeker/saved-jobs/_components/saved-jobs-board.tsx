/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/saved-jobs/_components/saved-jobs-board.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive client board for Figma's `Seeker / Saved Jobs`:
 *     - Live search bar + Upload Resume link -> `/dashboard/seeker/settings`
 *     - Header with `Total Saved` and `Closing Soon` stats
 *     - Category filter pills + Sort selector
 *     - 1-click Apply Now (`POST /applications`) and Remove from List (`DELETE /saved-jobs/:jobId`)
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, Clock, MapPin, Search, Trash2, Upload } from "lucide-react"

import type { SavedJobRow } from "@/lib/types/saved-jobs"
import { formatRelativeTime, formatSalary } from "@/lib/formatters"
import { removeSavedJob } from "@/lib/api/saved-jobs"
import { createApplication } from "@/lib/api/applications"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

function daysUntil(deadline?: string): number | null {
  if (!deadline) return null
  const ms = new Date(deadline).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function SavedJobsBoard({
  initialSavedJobs,
  user,
}: {
  initialSavedJobs: SavedJobRow[]
  user: { id: string; name: string; email: string }
}) {
  const [items, setItems] = React.useState(initialSavedJobs)
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("All Saved")
  const [sortBy, setSortBy] = React.useState<"recent" | "closing" | "salary">("recent")
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const closingSoonCount = items.filter((item) => {
    const d = daysUntil(item.job?.deadline)
    return d !== null && d >= 0 && d <= 7 && item.job?.status === "active"
  }).length

  // Compute unique categories with counts for Figma's filter pill bar
  const categoryCounts = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      const cat = item.job?.category || "Other"
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }
    return Array.from(counts.entries())
  }, [items])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = items.filter((item) => {
      const job = item.job
      if (!job) return false
      if (activeCategory !== "All Saved" && job.category !== activeCategory) return false
      if (!q) return true
      return (
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      )
    })

    if (sortBy === "salary") {
      list.sort((a, b) => Number(b.job?.maxSalary || 0) - Number(a.job?.maxSalary || 0))
    } else if (sortBy === "closing") {
      list.sort((a, b) => {
        const da = daysUntil(a.job?.deadline) ?? 9999
        const db = daysUntil(b.job?.deadline) ?? 9999
        return da - db
      })
    }
    return list
  }, [items, search, activeCategory, sortBy])

  const handleRemove = async (jobId: string, title: string) => {
    setBusyId(jobId)
    try {
      await removeSavedJob(jobId)
      setItems((prev) => prev.filter((item) => item.jobId !== jobId))
      toast.add({ title: "Removed", description: `${title} removed from Saved Jobs.` })
    } finally {
      setBusyId(null)
    }
  }

  const handleApply = async (item: SavedJobRow) => {
    const job = item.job
    if (!job) return
    setBusyId(item.jobId)
    try {
      const res = await createApplication({
        jobId: job._id,
        recruiterId: job.recruiterId,
        userId: user.id,
        applicantName: user.name,
        email: user.email,
        jobTitle: job.title,
        companyName: job.companyName,
        jobType: job.jobType,
        isRemote: job.isRemote,
        location: job.location,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        salaryFrequency: job.salaryFrequency,
        deadline: job.deadline,
        appliedAt: new Date().toISOString(),
        status: "applied",
        archived: false,
      })

      if (res.success || res.insertedId || res.alreadyApplied) {
        setItems((prev) =>
          prev.map((x) =>
            x.jobId === item.jobId ? { ...x, applicationStatus: "applied" } : x
          )
        )
        toast.add({
          title: res.alreadyApplied ? "Already Applied" : "Application Submitted",
          description: `Applied to ${job.title} at ${job.companyName}.`,
        })
      } else {
        toast.add({ title: "Could not apply", description: res.error || "Please try again." })
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top App Bar matching Figma Seeker / Saved Jobs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#A0A0AB]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies, or skills..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none placeholder:text-[#A0A0AB] focus:border-[#5C53FE]"
          />
        </div>

        <Link
          href="/dashboard/seeker/settings"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#141418] px-4 text-xs font-medium text-[#EDEDEF] transition-colors hover:border-white/25"
        >
          <Upload className="size-3.5" />
          Upload Resume
        </Link>
      </div>

      {/* Header + Total Saved / Closing Soon Bento */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#EDEDEF]">
            Saved Jobs
          </h1>
          <p className="mt-1 text-sm text-[#A0A0AB]">
            Manage and track your bookmarked opportunities.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="min-w-[130px] rounded-xl border border-white/10 bg-[#141418] px-5 py-3.5">
            <p className="text-xs text-[#A0A0AB]">Total Saved</p>
            <p className="mt-1 text-2xl font-semibold text-[#EDEDEF]">{items.length}</p>
          </div>
          <div className="min-w-[130px] rounded-xl border border-white/10 bg-[#141418] px-5 py-3.5">
            <p className="text-xs text-[#A0A0AB]">Closing Soon</p>
            <p className="mt-1 text-2xl font-semibold text-[#F59E0B]">{closingSoonCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Sort Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#141418] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("All Saved")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === "All Saved"
                ? "bg-[#232327] text-white"
                : "text-[#A0A0AB] hover:text-white"
            )}
          >
            All Saved ({items.length})
          </button>
          {categoryCounts.map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-[#232327] text-white"
                  : "text-[#A0A0AB] hover:text-white"
              )}
            >
              {cat} ({count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#A0A0AB]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "closing" | "salary")}
            className="rounded-lg border border-white/10 bg-[#0F0F12] px-2.5 py-1.5 text-xs text-[#EDEDEF] outline-none"
          >
            <option value="recent">Recently Saved</option>
            <option value="closing">Closing Soon</option>
            <option value="salary">Highest Salary</option>
          </select>
        </div>
      </div>

      {/* Bento Saved Job Cards */}
      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const job = item.job!
            const daysLeft = daysUntil(job.deadline)
            const isClosed = job.status !== "active" || (daysLeft !== null && daysLeft < 0)

            return (
              <div
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#141418] p-5 transition-colors hover:border-white/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                    {job.companyName}
                  </p>
                  <Link
                    href={`/browse-jobs/${job._id}`}
                    className="mt-0.5 block text-xl font-semibold text-[#EDEDEF] hover:text-[#8F88FF]"
                  >
                    {job.title}
                  </Link>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#EDEDEF]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-[#A0A0AB]" />
                      {job.location}
                      {job.isRemote ? " (Remote)" : ""}
                    </span>
                    <span className="text-[#6E6E78]">&bull;</span>
                    <span>{formatSalary(job.minSalary, job.maxSalary, job.salaryFrequency)}</span>
                    <span className="text-[#6E6E78]">&bull;</span>
                    <span className="text-[#A0A0AB]">
                      Saved {formatRelativeTime(item.savedAt)}
                    </span>

                    {isClosed ? (
                      <span className="text-[#EF4444]">Job closed by employer</span>
                    ) : daysLeft !== null && daysLeft <= 7 ? (
                      <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                        <Clock className="size-3" /> Closes in {daysLeft} days
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={busyId === item.jobId}
                    onClick={() => handleRemove(item.jobId, job.title)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 text-xs font-medium text-[#EF4444] transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="size-3.5" />
                    Remove from List
                  </button>

                  {isClosed ? (
                    <span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-[#1B1B20] px-3.5 text-xs text-[#A0A0AB]">
                      Closed
                    </span>
                  ) : item.applicationStatus ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#22C55E]/15 px-3.5 text-xs font-medium text-[#22C55E]">
                      <CheckCircle2 className="size-3.5" />
                      Applied
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === item.jobId}
                      onClick={() => handleApply(item)}
                      className="inline-flex h-9 items-center rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C] transition-colors hover:bg-white"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#141418] p-12 text-center">
          <p className="text-sm text-[#A0A0AB]">You haven&apos;t saved any jobs yet.</p>
          <Link
            href="/dashboard/seeker/jobs"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C]"
          >
            Browse Jobs to Save
          </Link>
        </div>
      )}
    </div>
  )
}
