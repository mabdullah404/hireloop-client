/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/jobs/[id]/_components/edit-job-form.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive 60% Form + 40% Live Preview editor for updating an existing job post.
 *   Calls `updateJob(job._id, form)` -> `PATCH http://localhost:5000/jobs/:id`.
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"

import {
  JOB_CATEGORIES,
  JOB_TYPES,
  SALARY_FREQUENCIES,
  type JobFormData,
  type JobRow,
  type JobStatus,
  type JobType,
} from "@/lib/types/jobs"
import { updateJob } from "@/lib/api/jobs"
import { formatSalary } from "@/lib/formatters"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function EditJobForm({ job }: { job: JobRow }) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<JobFormData>({
    title: job.title,
    companyName: job.companyName,
    recruiterId: job.recruiterId,
    category: job.category,
    jobType: job.jobType,
    isRemote: job.isRemote,
    location: job.location,
    deadline: job.deadline,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    salaryFrequency: job.salaryFrequency,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    applicants: job.applicants,
    status: job.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateJob(job._id, form)
      if (res?.success) {
        toast.add({
          title: "Job updated",
          description: `${form.title} has been updated successfully.`,
        })
        router.push("/dashboard/recruiter/jobs")
        router.refresh()
      } else {
        toast.add({ title: "Update failed", description: res?.message || "Please try again." })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb + Heading matching Figma Update Job Post */}
      <div>
        <Link
          href="/dashboard/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-[#A0A0AB] hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Manage Jobs &bull; Update Job Post
        </Link>
        <h1 className="page-title mt-2">Update Job Post</h1>
        <p className="mt-1 text-sm text-[#A0A0AB]">
          Modify position specifications, compensation range, and candidate requirements.
        </p>
      </div>

      {/* 60% Form + 40% Live Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
          {/* 1. Basic Information */}
          <section className="rounded-2xl border border-white/10 bg-[#141418] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">1. Basic Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Job Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Company Name *
                </label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Job Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                >
                  {JOB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Listing Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as JobStatus })
                  }
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                Job Type *
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, jobType: type as JobType })}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-xs font-medium capitalize transition-colors",
                      form.jobType === type
                        ? "border-[#5C53FE] bg-[#5C53FE]/20 text-white"
                        : "border-white/10 bg-[#0F0F12] text-[#A0A0AB] hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Location, Compensation & Timeline */}
          <section className="rounded-2xl border border-white/10 bg-[#141418] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              2. Location, Compensation &amp; Timeline
            </h2>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0F0F12] p-3.5">
              <div>
                <p className="text-sm font-medium text-white">Remote Work Allowed</p>
                <p className="text-xs text-[#A0A0AB]">
                  Enable worldwide or distributed candidate applications
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.isRemote}
                onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                className="size-4 accent-[#5C53FE]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Job Location *
                </label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Min Salary / Rate
                </label>
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Max Salary / Rate
                </label>
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                  Frequency
                </label>
                <select
                  value={form.salaryFrequency}
                  onChange={(e) => setForm({ ...form, salaryFrequency: e.target.value })}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
                >
                  {SALARY_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 3. Responsibilities & Requirements */}
          <section className="rounded-2xl border border-white/10 bg-[#141418] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              3. Responsibilities &amp; Requirements
            </h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                Key Responsibilities *
              </label>
              <textarea
                rows={4}
                required
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0F0F12] p-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#F4F4F5]">
                Qualifications &amp; Requirements *
              </label>
              <textarea
                rows={4}
                required
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0F0F12] p-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="btn-brand h-12 rounded-xl px-8 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Job"}
          </button>
        </form>

        {/* Right 40%: Live Card Preview */}
        <aside className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-[#141418] p-6">
            <p className="overline-label">Live Preview</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="brand-chip flex size-12 items-center justify-center rounded-xl text-lg font-bold">
                {(form.companyName || "H").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {form.title || "Job Title"}
                </h3>
                <p className="text-xs text-[#A0A0AB]">{form.companyName || "Company"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-[#1E1E25] px-2.5 py-1 capitalize text-white">
                {form.jobType}
              </span>
              <span className="rounded-md bg-[#1E1E25] px-2.5 py-1 text-white">
                {form.category}
              </span>
              <span className="rounded-md bg-[#5C53FE]/20 px-2.5 py-1 text-[#C3C0FF]">
                {formatSalary(form.minSalary, form.maxSalary, form.salaryFrequency)}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-[#A0A0AB]">
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {form.location} {form.isRemote ? "(Remote)" : ""}
              </p>
              {form.deadline ? (
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Deadline: {form.deadline}
                </p>
              ) : null}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-white">Responsibilities</p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#A0A0AB]">
                {form.responsibilities || "—"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
