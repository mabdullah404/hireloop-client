/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/jobs/[id]/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Recruiter "Update Job Post" page matching Figma's `Update Job Post` frame
 *   (`Manage Jobs > Job Listings & Postings > Update Job Post`).
 *   Loads the existing job via `GET /jobs/:id` and renders the 60% Form + 40% Live Preview editor!
 *
 * API CALLS MADE HERE:
 *   - `getJobById(id)` -> `GET http://localhost:5000/jobs/:id`
 *   - `updateJob(id)`  -> `PATCH http://localhost:5000/jobs/:id`
 * ==============================================================================
 */

import { notFound } from "next/navigation"
import { PageContainer } from "@/components/dashboard/page-shell"
import { getJobById } from "@/lib/api/jobs"
import { EditJobForm } from "./_components/edit-job-form"

export default async function EditRecruiterJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) notFound()

  return (
    <PageContainer width="wide">
      <EditJobForm job={job} />
    </PageContainer>
  )
}
