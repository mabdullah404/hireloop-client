/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/jobs/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Seeker "Jobs" tab (`/dashboard/seeker/jobs`) where logged-in job seekers can
 *   browse, search, filter, 1-click bookmark, and 1-click apply to available jobs
 *   without leaving their dashboard workspace!
 *
 * API CALLS MADE HERE:
 *   - `getJobs("status=active")`          -> `GET http://localhost:5000/jobs?status=active`
 *   - `getSavedJobs()`                    -> `GET http://localhost:5000/saved-jobs`
 *   - `getApplications("applicantId=...")`-> `GET http://localhost:5000/applications`
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getSession } from "@/lib/core/server"
import { getJobs } from "@/lib/api/jobs"
import { getSavedJobs } from "@/lib/api/saved-jobs"
import { getApplications } from "@/lib/api/applications"
import { SeekerJobsExplorer } from "./_components/seeker-jobs-explorer"

export default async function SeekerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const [{ search = "" }, session] = await Promise.all([searchParams, getSession()])
  const userId = session?.user?.id || ""

  const [jobs, savedJobs, myApps] = await Promise.all([
    getJobs("status=active"),
    getSavedJobs(),
    userId ? getApplications(`applicantId=${userId}`) : Promise.resolve([]),
  ])

  return (
    <PageContainer width="wide">
      <PageHeader
        overline="Job Discovery"
        title="Available Jobs"
        subtitle="Search active listings, bookmark favorites, and submit 1-click applications."
      />

      <SeekerJobsExplorer
        jobs={jobs}
        initialSavedIds={savedJobs.map((s) => s.jobId)}
        initialAppliedIds={myApps.map((a) => a.jobId)}
        initialSearch={search}
        user={{
          id: userId,
          name: session?.user?.name || "Job Seeker",
          email: session?.user?.email || "",
        }}
      />
    </PageContainer>
  )
}
