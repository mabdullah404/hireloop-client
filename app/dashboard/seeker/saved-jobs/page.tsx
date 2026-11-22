/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/saved-jobs/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Seeker Saved Jobs page matching Figma `Seeker / Saved Jobs`:
 *     - Total Saved & Closing Soon KPI tiles
 *     - Category tabs (All Saved, Design, Engineering, Product...) + Sort dropdown
 *     - Bento job list cards with Apply Now & Remove from List actions
 *
 * API CALLS MADE HERE:
 *   - `getSavedJobs()` -> `GET http://localhost:5000/saved-jobs`
 * ==============================================================================
 */

import { PageContainer } from "@/components/dashboard/page-shell"
import { getSession } from "@/lib/core/server"
import { getSavedJobs } from "@/lib/api/saved-jobs"
import { SavedJobsBoard } from "./_components/saved-jobs-board"

export default async function SeekerSavedJobsPage() {
  const [session, savedJobs] = await Promise.all([getSession(), getSavedJobs()])

  return (
    <PageContainer width="wide">
      <SavedJobsBoard
        initialSavedJobs={savedJobs}
        user={{
          id: session?.user?.id || "",
          name: session?.user?.name || "Job Seeker",
          email: session?.user?.email || "",
        }}
      />
    </PageContainer>
  )
}
