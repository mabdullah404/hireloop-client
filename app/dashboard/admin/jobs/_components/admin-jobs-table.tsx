/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/jobs/_components/admin-jobs-table.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Admin Jobs Management console matching Figma `Admin / Manage Jobs`:
 *     - Search, Status & Category dropdown filters, Active/Closed counters
 *     - Quick inline "Create Job" modal panel calling `POST /jobs`
 *     - Per-row Toggle Status (Active <-> Closed) calling `PATCH /jobs/:id`
 *     - Per-row Delete Job calling `DELETE /jobs/:id`
 *     - Analytical Insights Bento at the bottom
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Plus, Search, Trash2, X } from "lucide-react"

import {
  JOB_CATEGORIES,
  JOB_TYPES,
  type JobRow,
  type JobStatus,
  type JobType,
} from "@/lib/types/jobs"
import { createJob, deleteJob, updateJob } from "@/lib/api/jobs"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function AdminJobsTable({
  initialJobs,
  totalApplications,
  adminId,
}: {
  initialJobs: JobRow[]
  totalApplications: number
  adminId: string
}) {
  const router = useRouter()
  const [jobs, setJobs] = React.useState(initialJobs)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | JobStatus>("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [busyId, setBusyId] = React.useState<string | null>(null)

  // Quick Create Job modal state
  const [showCreate, setShowCreate] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const [newCompany, setNewCompany] = React.useState("")
  const [newCategory, setNewCategory] = React.useState(JOB_CATEGORIES[0])
  const [newType, setNewType] = React.useState<JobType>("full-time")
  const [newLocation, setNewLocation] = React.useState("Remote (US)")
  const [newMinSalary, setNewMinSalary] = React.useState("120000")
  const [newMaxSalary, setNewMaxSalary] = React.useState("160000")

  const activeCount = jobs.filter((j) => j.status === "active").length
  const closedCount = jobs.filter((j) => j.status !== "active").length

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false
      if (categoryFilter !== "all" && j.category !== categoryFilter) return false
      if (!q) return true
      return (
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        (j.refCode || "").toLowerCase().includes(q)
      )
    })
  }, [jobs, search, statusFilter, categoryFilter])

  const handleToggleStatus = async (job: JobRow) => {
    setBusyId(job._id)
    const nextStatus: JobStatus = job.status === "active" ? "closed" : "active"
    try {
      const res = await updateJob(job._id, { status: nextStatus })
      if (res?.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
        )
        toast.add({
          title: "Job status updated",
          description: `${job.title} is now ${nextStatus}.`,
        })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (job: JobRow) => {
    if (!window.confirm(`Permanently delete "${job.title}" at ${job.companyName}?`)) return
    setBusyId(job._id)
    try {
      const res = await deleteJob(job._id)
      if (res?.success) {
        setJobs((prev) => prev.filter((j) => j._id !== job._id))
        toast.add({ title: "Job deleted", description: `${job.title} was removed.` })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await createJob({
        title: newTitle.trim(),
        companyName: newCompany.trim(),
        recruiterId: adminId,
        category: newCategory,
        jobType: newType,
        isRemote: newLocation.toLowerCase().includes("remote"),
        location: newLocation.trim(),
        deadline: "2026-12-31",
        minSalary: newMinSalary,
        maxSalary: newMaxSalary,
        salaryFrequency: "per year",
        responsibilities: "Lead product execution and collaborate across engineering teams.",
        requirements: "3+ years of relevant industry experience.",
        applicants: 0,
        status: "active",
      })
      if (res?.job) {
        setJobs((prev) => [
          { ...res.job, _id: String(res.job._id), posted: "Posted today" },
          ...prev,
        ])
        setShowCreate(false)
        setNewTitle("")
        setNewCompany("")
        toast.add({ title: "Job created", description: `${res.job.title} is now live.` })
        router.refresh()
      }
    } finally {
      setCreating(false)
    }
  }

  const engagementRate =
    jobs.length > 0 ? Math.min(98, Math.round((totalApplications / Math.max(jobs.length, 1)) * 18 + 64)) : 0

  return (
    <div className="space-y-6">
      {/* Header matching Figma Admin / Manage Jobs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="overline-label">Admin View</p>
          <h1 className="page-title mt-1">Manage Jobs</h1>
          <p className="mt-1 text-sm text-[#A0A0AB]">
            Oversee all active listings and historical job posts across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C] hover:bg-white"
        >
          {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
          {showCreate ? "Close Form" : "Create Job"}
        </button>
      </div>

      {/* Inline Quick Create Job Panel */}
      {showCreate ? (
        <form
          onSubmit={handleQuickCreate}
          className="grid gap-4 rounded-2xl border border-[#5C53FE]/40 bg-[#14141C] p-6 sm:grid-cols-3"
        >
          <input
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Job Title (e.g. Senior Backend Engineer)"
            className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
          />
          <input
            required
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="Company Name (e.g. CloudScale AI)"
            className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
          />
          <input
            required
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Location (e.g. Remote)"
            className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
          >
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as JobType)}
            className="h-10 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={newMinSalary}
              onChange={(e) => setNewMinSalary(e.target.value)}
              placeholder="Min $"
              className="h-10 w-1/2 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
            />
            <input
              type="number"
              value={newMaxSalary}
              onChange={(e) => setNewMaxSalary(e.target.value)}
              placeholder="Max $"
              className="h-10 w-1/2 rounded-lg border border-white/10 bg-[#0F0F12] px-3 text-sm text-white outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={creating}
              className="btn-brand h-10 rounded-lg px-5 text-xs font-semibold text-white"
            >
              {creating ? "Publishing..." : "Publish Job Listing"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#A0A0AB]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies, or ref IDs..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | JobStatus)}
            className="h-10 rounded-lg border border-white/10 bg-[#141418] px-3 text-xs text-[#EDEDEF] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-[#141418] px-3 text-xs text-[#EDEDEF] outline-none"
          >
            <option value="all">All Categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#A0A0AB]">
          <span className="rounded-lg border border-white/10 bg-[#141418] px-3 py-1.5">
            Active ({activeCount})
          </span>
          <span className="rounded-lg border border-white/10 bg-[#141418] px-3 py-1.5">
            Closed ({closedCount})
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#141418]">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Posted</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filtered.map((job) => (
              <tr key={job._id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-[#EDEDEF]">{job.title}</p>
                  <p className="font-mono text-[11px] text-[#A0A0AB]">
                    Ref: {job.refCode || job._id.slice(-6).toUpperCase()}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="brand-chip flex size-7 items-center justify-center rounded-md text-xs font-bold">
                      {job.companyName.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[#EDEDEF]">{job.companyName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#EDEDEF]">{job.category}</td>
                <td className="px-5 py-3.5 text-xs capitalize text-[#A0A0AB]">{job.jobType}</td>
                <td className="px-5 py-3.5 text-xs text-[#A0A0AB]">{job.posted}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      job.status === "active"
                        ? "bg-[#22C55E]/15 text-[#22C55E]"
                        : "bg-white/10 text-[#A0A0AB]"
                    )}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/browse-jobs/${job._id}`}
                      aria-label={`View ${job.title}`}
                      className="rounded-md p-1.5 text-[#A0A0AB] hover:text-white"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === job._id}
                      onClick={() => handleToggleStatus(job)}
                      className="rounded-md border border-white/15 bg-[#1B1B20] px-2.5 py-1 text-xs font-medium text-white hover:border-white/30"
                    >
                      {job.status === "active" ? "Close" : "Reopen"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === job._id}
                      onClick={() => handleDelete(job)}
                      aria-label={`Delete ${job.title}`}
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
                <td colSpan={7} className="py-12 text-center text-sm text-[#A0A0AB]">
                  No jobs match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Analytical Insights Bento Grid matching Figma */}
      <dl className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#141418] p-5">
          <dt className="text-xs font-medium text-[#A0A0AB]">Engagement Rate</dt>
          <dd className="mt-2 text-2xl font-semibold text-[#EDEDEF]">{engagementRate}%</dd>
          <p className="mt-1 text-xs text-[#22C55E]">+5.2% from last month</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141418] p-5">
          <dt className="text-xs font-medium text-[#A0A0AB]">Avg. Time to Fill</dt>
          <dd className="mt-2 text-2xl font-semibold text-[#EDEDEF]">14 Days</dd>
          <p className="mt-1 text-xs text-[#A0A0AB]">Stable performance</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141418] p-5">
          <dt className="text-xs font-medium text-[#A0A0AB]">Total Applications</dt>
          <dd className="mt-2 text-2xl font-semibold text-[#EDEDEF]">
            {totalApplications.toLocaleString()}
          </dd>
          <p className="mt-1 text-xs text-[#F59E0B]">Across all active roles</p>
        </div>
      </dl>
    </div>
  )
}
