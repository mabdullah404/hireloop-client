/**
 * ==============================================================================
 * FILE: client/lib/api/applications.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for reading & creating Job Applications via Express.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET  http://localhost:5001/applications        -> getApplications(query)      [Auth]
 *   - GET  http://localhost:5001/applications/count  -> getApplicationsCount(query) [Public]
 *   - POST http://localhost:5001/applications        -> createApplication(data)     [Seeker]
 *
 * USED BY:
 *   - `client/app/browse-jobs/[id]/page.tsx` & `_components/job-header-card.tsx`
 *   - `client/app/dashboard/seeker/applications/page.tsx`
 *   - `client/app/dashboard/seeker/saved-jobs/_components/saved-jobs-board.tsx`
 *   - `client/app/dashboard/recruiter/applications/page.tsx`
 *   - `client/app/dashboard/recruiter/jobs/[id]/applications/page.tsx`
 * ==============================================================================
 */

"use server"

import type { ApplicationFormData, ApplicationRow } from "@/lib/types/applications"
import { authFetch, protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `GET /applications?<query>` with the user's Bearer token.
 * Examples:
 *   - `getApplications("applicantId=123")` -> Seeker's own applications
 *   - `getApplications("jobId=456")`       -> All applicants for one job
 *   - `getApplications("recruiterId=789")` -> All applicants across a recruiter's jobs
 */
export const getApplications = async (query = ""): Promise<ApplicationRow[]> => {
  try {
    const api = query ? `${BASE_URL}/applications?${query}` : `${BASE_URL}/applications`
    const res = await authFetch(api)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `GET /applications/count?<query>` to get a fast integer count.
 */
export const getApplicationsCount = async (query = ""): Promise<{ count: number }> => {
  try {
    const res = await fetch(`${BASE_URL}/applications/count?${query}`, { cache: "no-store" })
    if (!res.ok) return { count: 0 }
    return res.json()
  } catch {
    return { count: 0 }
  }
}

/**
 * Calls `POST /applications` (Protected: Job Seeker only).
 * Submits a new application and increments the job's applicant count in MongoDB.
 */
export const createApplication = async (data: ApplicationFormData) => {
  const res = await protectedMutation(`${BASE_URL}/applications`, "POST", data)
  const json = await res.json()
  if (!res.ok) {
    return { success: false, error: json.message || "Failed to apply", ...json }
  }
  return { success: true, ...json }
}
