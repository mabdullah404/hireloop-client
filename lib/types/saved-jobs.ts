/**
 * ==============================================================================
 * FILE: client/lib/types/saved-jobs.ts
 * ==============================================================================
 * PURPOSE:
 *   TypeScript type for a bookmarked/saved job returned by `GET /saved-jobs`.
 * ==============================================================================
 */

import type { JobRow } from "@/lib/types/jobs"

export type SavedJobRow = {
  _id: string
  jobId: string
  userId: string
  savedAt: string
  applicationStatus: string | null
  job: JobRow | null
}
