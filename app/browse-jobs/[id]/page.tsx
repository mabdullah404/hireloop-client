/**
 * ==============================================================================
 * FILE: client/app/browse-jobs/[id]/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Job Details page matching Figma `Public / Job Details`:
 *     - `JobHeaderCard`: Title, company, Verified Employer badge, Bookmark, Apply Now
 *     - `JobHighlights`: 4-cell strip (Salary Range, Location, Job Type, Deadline/Experience)
 *     - `JobContentCard`: Job Description, Responsibilities, Requirements, Skills, Benefits
 *     - `CompanyOverviewCard`: Right sidebar company info card
 *
 * API CALLS MADE HERE:
 *   - `getJobById(id)` -> `GET http://localhost:5000/jobs/:id`
 *   - `getSavedJobs()` -> `GET http://localhost:5000/saved-jobs`
 * ==============================================================================
 */

import { notFound } from "next/navigation"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { getJobById } from "@/lib/api/jobs"
import { getSavedJobs } from "@/lib/api/saved-jobs"

import { JobHeaderCard } from "./_components/job-header-card"
import { JobHighlights } from "./_components/job-highlights"
import { JobContentCard } from "./_components/job-content-card"
import { CompanyOverviewCard } from "./_components/company-overview-card"

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [job, savedList] = await Promise.all([getJobById(id), getSavedJobs()])

  if (!job) notFound()

  const isSaved = savedList.some((s) => s.jobId === job._id)

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF]">
      <SiteNavbar />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6">
        <JobHeaderCard job={job} initialSaved={isSaved} />

        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_397px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-6">
            <JobHighlights job={job} />
            <JobContentCard job={job} />
          </div>

          <div>
            <CompanyOverviewCard job={job} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
