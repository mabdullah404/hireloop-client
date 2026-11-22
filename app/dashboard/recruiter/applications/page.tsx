/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/applications/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Recruiter "Applications" tab (`/dashboard/recruiter/applications`).
 *   Displays EVERY candidate application across ALL jobs posted by this recruiter,
 *   allowing instant status updates (`applied` -> `review` -> `shortlisted` ->
 *   `interview` -> `offered` / `rejected`).
 *
 * API CALLS MADE HERE:
 *   - `getApplications("recruiterId=<id>")` -> `GET http://localhost:5000/applications?recruiterId=...`
 *   - `updateApplicationStatus()`           -> `PATCH http://localhost:5000/applications/:id`
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getSession } from "@/lib/core/server"
import { getApplications } from "@/lib/api/applications"
import { ApplicationsReviewTable } from "../jobs/[id]/applications/_components/applications-review-table"

export default async function RecruiterAllApplicationsPage() {
  const session = await getSession()
  const recruiterId = session?.user?.id || ""
  const applications = recruiterId
    ? await getApplications(`recruiterId=${recruiterId}`)
    : []

  return (
    <PageContainer width="wide">
      <PageHeader
        overline="Candidate Pipeline"
        title="All Job Applications"
        subtitle="Review candidates across all of your active and closed job postings."
      />

      <ApplicationsReviewTable applications={applications} />
    </PageContainer>
  )
}
