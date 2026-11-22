/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/jobs/_components/seeker-jobs-explorer.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Jobs explorer inside the Job Seeker dashboard.
 *   Supports live search, category filter, remote toggle, Save/Unsave bookmark,
 *   and 1-click Apply Now!
 *
 * API CALLS TRIGGERED:
 *   - `createApplication()` -> `POST http://localhost:5000/applications`
 *   - `<SaveJobButton />`   -> `POST/DELETE http://localhost:5000/saved-jobs`
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, MapPin, Search } from "lucide-react"

import { JOB_CATEGORIES, type JobRow } from "@/lib/types/jobs"
import { formatSalary } from "@/lib/formatters"
import { createApplication } from "@/lib/api/applications"
import { SaveJobButton } from "@/app/components/SaveJobButton"
import { toast } from "@/components/ui/toast"

export function SeekerJobsExplorer({
  jobs,
  initialSavedIds,
  initialAppliedIds,
  initialSearch,
  user,
}: {
  jobs: JobRow[]
  initialSavedIds: string[]
  initialAppliedIds: string[]
  initialSearch: string
  user: { id: string; name: string; email: string }
}) {
  const [search, setSearch] = React.useState(initialSearch)
  const [category, setCategory] = React.useState("all")
  const [remoteOnly, setRemoteOnly] = React.useState(false)
  const [appliedIds, setAppliedIds] = React.useState<Set<string>>(new Set(initialAppliedIds))
  const [applyingId, setApplyingId] = React.useState<string | null>(null)
  const savedSet = React.useMemo(() => new Set(initialSavedIds), [initialSavedIds])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (category !== "all" && job.category !== category) return false
      if (remoteOnly && !job.isRemote) return false
      if (!q) return true
      return (
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      )
    })
  }, [jobs, search, category, remoteOnly])

  const handleQuickApply = async (job: JobRow) => {
    setApplyingId(job._id)
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
        setAppliedIds((prev) => new Set(prev).add(job._id))
        toast.add({
          title: res.alreadyApplied ? "Already Applied" : "Application Submitted",
          description: `You applied to ${job.title} at ${job.companyName}.`,
        })
      } else {
        toast.add({ title: "Error", description: res.error || "Could not apply." })
      }
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search + Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#141418] p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#828997]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or location..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#0F0F12] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
        >
          <option value="all">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF]">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="accent-[#5C53FE]"
          />
          Remote Only
        </label>
      </div>

      {/* Results Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => {
            const isApplied = appliedIds.has(job._id)
            return (
              <div
                key={job._id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#141418] p-5 transition-colors hover:border-[#5C53FE]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                        {job.companyName}
                      </p>
                      <Link
                        href={`/browse-jobs/${job._id}`}
                        className="mt-1 block truncate text-lg font-semibold text-[#EDEDEF] hover:text-[#8F88FF]"
                      >
                        {job.title}
                      </Link>
                    </div>
                    <SaveJobButton
                      jobId={job._id}
                      jobTitle={job.title}
                      initialSaved={savedSet.has(job._id)}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#A0A0AB]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {job.location}
                      {job.isRemote ? " (Remote)" : ""}
                    </span>
                    <span>&bull;</span>
                    <span className="capitalize">{job.jobType}</span>
                    <span>&bull;</span>
                    <span className="text-[#EDEDEF]">
                      {formatSalary(job.minSalary, job.maxSalary, job.salaryFrequency)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <Link
                    href={`/browse-jobs/${job._id}`}
                    className="text-xs font-medium text-[#A0A0AB] hover:text-white"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    disabled={isApplied || applyingId === job._id}
                    onClick={() => handleQuickApply(job)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C] transition-colors hover:bg-white disabled:opacity-60"
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-[#22C55E]" />
                        Applied
                      </>
                    ) : applyingId === job._id ? (
                      "Applying..."
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-[#141418] p-12 text-center text-sm text-[#A0A0AB]">
          No jobs match your filters. Try clearing your search term.
        </div>
      )}
    </div>
  )
}
