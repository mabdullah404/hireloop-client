/**
 * ==============================================================================
 * FILE: client/lib/api/saved-jobs.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for Seeker Saved Jobs (Bookmarks) CRUD.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET    http://localhost:5001/saved-jobs         -> getSavedJobs()      [Auth]
 *   - POST   http://localhost:5001/saved-jobs         -> saveJob(jobId)      [Auth]
 *   - DELETE http://localhost:5001/saved-jobs/:jobId  -> removeSavedJob(id)  [Auth]
 *
 * USED BY:
 *   - `client/app/dashboard/seeker/saved-jobs/page.tsx`
 *   - `client/app/dashboard/seeker/jobs/page.tsx`
 *   - `client/app/components/SaveJobButton.tsx`
 *   - `client/app/browse-jobs/page.tsx` & `[id]/page.tsx`
 * ==============================================================================
 */

"use server"

import { authFetch, getSession, protectedMutation } from "@/lib/core/server"
import type { SavedJobRow } from "@/lib/types/saved-jobs"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `GET /saved-jobs` for the logged-in user.
 * Safely returns `[]` if the visitor is a guest (not logged in).
 */
export const getSavedJobs = async (): Promise<SavedJobRow[]> => {
  const session = await getSession()
  if (!session) return []
  try {
    const res = await authFetch(`${BASE_URL}/saved-jobs`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `POST /saved-jobs` to bookmark a job into MongoDB's `savedJobs` collection.
 */
export const saveJob = async (jobId: string) => {
  const res = await protectedMutation(`${BASE_URL}/saved-jobs`, "POST", { jobId })
  return res.json()
}

/**
 * Calls `DELETE /saved-jobs/:jobId` to remove a job from the user's Saved Jobs list.
 */
export const removeSavedJob = async (jobId: string) => {
  const res = await protectedMutation(`${BASE_URL}/saved-jobs/${jobId}`, "DELETE")
  return res.json()
}
