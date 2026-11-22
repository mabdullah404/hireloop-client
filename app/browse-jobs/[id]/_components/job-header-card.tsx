/**
 * ==============================================================================
 * FILE: client/app/browse-jobs/[id]/_components/job-header-card.tsx
 * ==============================================================================
 * PURPOSE:
 *   Top header card on `/browse-jobs/[id]` (matching Figma `Public / Job Details`).
 *   Handles BOTH interactive actions:
 *     1. Save / Bookmark Job -> `<SaveJobButton />` (`POST/DELETE /saved-jobs`)
 *     2. Apply Now -> checks login + seeker role, calls `POST /applications` via
 *        `createApplication()`, prevents duplicate applications, and shows toast feedback!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { BadgeCheck, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

import type { JobRow } from "@/lib/types/jobs"
import type { ApplicationFormData } from "@/lib/types/applications"
import { useSession } from "@/lib/auth-client"
import { createApplication } from "@/lib/api/applications"
import { SaveJobButton } from "@/app/components/SaveJobButton"
import { toast } from "@/components/ui/toast"

export function JobHeaderCard({
  job,
  initialSaved = false,
}: {
  job: JobRow
  initialSaved?: boolean
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const [applying, setApplying] = React.useState(false)
  const [applied, setApplied] = React.useState(false)

  const handleApplyNow = async () => {
    // 1. Require login before applying
    if (!user) {
      router.push(`/sign-in?redirectTo=/browse-jobs/${job._id}`)
      return
    }

    // 2. Only Job Seekers can submit applications
    if (user.role !== "seeker") {
      toast.add({
        title: "Job Seeker account required",
        description: `You are signed in as a ${user.role}. Switch to a Job Seeker account to apply.`,
      })
      return
    }

    setApplying(true)
    try {
      const application: ApplicationFormData = {
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
      }

      const result = await createApplication(application)
      if (result.alreadyApplied) {
        setApplied(true)
        toast.add({
          title: "Already Applied",
          description: "You have already submitted an application for this position.",
        })
        return
      }

      if (result.success || result.insertedId) {
        setApplied(true)
        toast.add({
          title: "Application submitted!",
          description: `Your application for ${job.title} at ${job.companyName} has been sent.`,
        })
        router.refresh()
      } else {
        toast.add({
          title: "Could not apply",
          description: result.error || "Please try again.",
        })
      }
    } finally {
      setApplying(false)
    }
  }

  return (
    <section className="flex flex-wrap items-start justify-between gap-6 rounded-xl border border-white/10 bg-[#141418] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="flex min-w-0 flex-wrap items-start gap-6">
        {/* Company initial tile */}
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1F]">
          <span className="brand-chip flex size-[70px] items-center justify-center rounded-xl text-2xl font-semibold">
            {job.companyName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#EDEDEF] sm:text-[32px]">
              {job.title}
            </h1>
            {job.status !== "active" ? (
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
                Closed
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-lg font-semibold text-[#A0A0AB] sm:text-[22px]">
              {job.companyName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-semibold text-[#22C55E]">
              <BadgeCheck className="size-3.5" />
              Verified Employer
            </span>
            <span aria-hidden className="size-1 rounded-full bg-[#8E9192]" />
            <span className="text-sm text-[#EDEDEF]">
              {job.location}
              {job.isRemote ? " (Remote)" : ""}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-[#8E9192]" />
            <span className="text-sm capitalize text-[#EDEDEF]">{job.jobType}</span>
          </div>
        </div>
      </div>

      {/* Actions: Bookmark + Apply Now */}
      <div className="flex items-center gap-3">
        <SaveJobButton
          jobId={job._id}
          jobTitle={job.title}
          initialSaved={initialSaved}
          className="size-12"
        />

        <button
          type="button"
          disabled={applying || applied || job.status !== "active"}
          onClick={handleApplyNow}
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#FAFAFA] px-5 text-base font-medium text-[#0B0B0C] shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {applied ? (
            <>
              <CheckCircle2 className="size-4 text-[#22C55E]" />
              Applied
            </>
          ) : applying ? (
            "Applying..."
          ) : (
            "Apply Now"
          )}
        </button>
      </div>
    </section>
  )
}
