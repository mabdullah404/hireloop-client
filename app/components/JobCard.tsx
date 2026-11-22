/**
 * ==============================================================================
 * FILE: client/app/components/JobCard.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Job Card matching Figma `Public / Browse Jobs`:
 *     - Company logo initial tile + Job Title + Company & Location line
 *     - Salary Range pill, Job Type pill, Remote pill, Easy Apply / Hot Job badge
 *     - Live Bookmark button (`SaveJobButton`) calling `POST/DELETE /saved-jobs`
 *     - Clicking the card navigates to `/browse-jobs/<job._id>`
 *
 * USED BY:
 *   - `client/app/browse-jobs/page.tsx`
 * ==============================================================================
 */

"use client"

import Link from "next/link"
import { Flame, Sparkles } from "lucide-react"
import type { JobRow } from "@/lib/types/jobs"
import { formatSalary } from "@/lib/formatters"
import { SaveJobButton } from "@/app/components/SaveJobButton"

const JobCard = ({
  job,
  initialSaved = false,
}: {
  job: JobRow
  initialSaved?: boolean
}) => {
  return (
    <li className="group rounded-xl border border-white/10 bg-[#141418] p-5 transition-colors hover:border-[#5C53FE]/50 hover:bg-[#17171D]">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/browse-jobs/${job._id}`} className="flex min-w-0 flex-1 items-start gap-4">
          {/* Company initial tile */}
          <div className="brand-chip flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold">
            {job.companyName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading truncate text-lg font-semibold text-[#EDEDEF] transition-colors group-hover:text-[#8F88FF] sm:text-xl">
                {job.title}
              </h3>
              {job.isHot ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/15 px-2.5 py-0.5 text-xs font-medium text-[#F59E0B]">
                  <Flame className="size-3" /> Hot Job
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm font-medium text-[#8C8C96]">
              {job.companyName} &bull; {job.location}
              {job.isRemote ? " (Remote)" : ""}
            </p>

            {/* Figma Metadata Pills Row */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-[#1C1C22] px-2.5 py-1 text-xs font-medium text-[#EDEDEF]">
                {formatSalary(job.minSalary, job.maxSalary, job.salaryFrequency)}
              </span>
              <span className="rounded-md border border-white/10 bg-[#1C1C22] px-2.5 py-1 text-xs font-medium capitalize text-[#EDEDEF]">
                {job.jobType}
              </span>
              {job.isRemote ? (
                <span className="rounded-md border border-[#5C53FE]/30 bg-[#5C53FE]/10 px-2.5 py-1 text-xs font-medium text-[#8F88FF]">
                  Remote
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-md bg-[#22C55E]/10 px-2.5 py-1 text-xs font-medium text-[#22C55E]">
                <Sparkles className="size-3" /> Easy Apply
              </span>
              <span className="ml-auto text-xs text-[#6E6E78]">{job.posted}</span>
            </div>
          </div>
        </Link>

        {/* Bookmark Button */}
        <SaveJobButton
          jobId={job._id}
          jobTitle={job.title}
          initialSaved={initialSaved}
        />
      </div>
    </li>
  )
}

export default JobCard
