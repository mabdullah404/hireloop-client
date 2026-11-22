/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/jobs/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Admin Manage Jobs page matching Figma `Admin / Manage Jobs`:
 *     - Header with "Create Job" toggle form
 *     - Filters (Status, Category) + Active / Closed pill counters
 *     - Data Table (Title + Ref Code, Company, Category, Type, Date Posted, Status toggle, Delete)
 *     - Analytical Insights Bento Grid (Engagement Rate, Avg. Time to Fill, Total Applications)
 *
 * API CALLS MADE HERE:
 *   - `getJobs()`              -> `GET http://localhost:5000/jobs`
 *   - `getApplicationsCount()` -> `GET http://localhost:5000/applications/count`
 *   - `createJob / updateJob / deleteJob` -> `POST / PATCH / DELETE /jobs`
 * ==============================================================================
 */

import { PageContainer } from "@/components/dashboard/page-shell"
import { getSession } from "@/lib/core/server"
import { getJobs } from "@/lib/api/jobs"
import { getApplicationsCount } from "@/lib/api/applications"
import { AdminJobsTable } from "./_components/admin-jobs-table"

export default async function AdminJobsPage() {
  const [session, jobs, appCount] = await Promise.all([
    getSession(),
    getJobs(),
    getApplicationsCount(),
  ])

  return (
    <PageContainer width="wide">
      <AdminJobsTable
        initialJobs={jobs}
        totalApplications={appCount.count}
        adminId={session?.user?.id || ""}
      />
    </PageContainer>
  )
}
