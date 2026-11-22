/**
 * ==============================================================================
 * FILE: client/lib/api/jobs.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for ALL Job CRUD operations against the Express backend.
 *   Because this file has `"use server"`, these functions can be called safely
 *   from BOTH Server Components AND Client Components!
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET    http://localhost:5001/jobs        -> getJobs(query)
 *   - GET    http://localhost:5001/jobs/:id    -> getJobById(jobId)
 *   - POST   http://localhost:5001/jobs        -> createJob(data)        [Recruiter/Admin]
 *   - PATCH  http://localhost:5001/jobs/:id    -> updateJob(id, data)    [Recruiter/Admin]
 *   - DELETE http://localhost:5001/jobs/:id    -> deleteJob(jobId)       [Recruiter/Admin]
 *
 * USED BY:
 *   - `client/app/page.tsx` (Homepage Featured Jobs)
 *   - `client/app/browse-jobs/page.tsx` & `[id]/page.tsx`
 *   - `client/app/dashboard/seeker/jobs/page.tsx`
 *   - `client/app/dashboard/recruiter/jobs/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
 *   - `client/app/dashboard/admin/jobs/page.tsx`
 *   - `client/app/components/DeleteJobDialog.tsx`
 * ==============================================================================
 */

"use server"

import type { JobFormData, JobRow } from "@/lib/types/jobs"
import { protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `GET /jobs?<query>` on Express (Public).
 * Returns an array of jobs matching the optional query string (search, category, jobType, etc.).
 */
export const getJobs = async (query = ""): Promise<JobRow[]> => {
  try {
    const url = query ? `${BASE_URL}/jobs?${query}` : `${BASE_URL}/jobs`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `GET /jobs/:id` on Express (Public).
 * Returns one single job document (plus its `companyInfo` sidebar snapshot) or `null`.
 */
export const getJobById = async (jobId: string): Promise<JobRow | null> => {
  try {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Calls `POST /jobs` on Express (Protected: Recruiter or Admin).
 * Inserts a brand-new job listing into MongoDB's `jobs` collection.
 */
export const createJob = async (data: JobFormData) => {
  const res = await protectedMutation(`${BASE_URL}/jobs`, "POST", data)
  return res.json()
}

/**
 * Calls `PATCH /jobs/:id` on Express (Protected: Owning Recruiter or Admin).
 * Updates an existing job's details or toggles its `status` (`"active"` | `"closed"` | `"expired"`).
 */
export const updateJob = async (jobId: string, data: Partial<JobFormData>) => {
  const res = await protectedMutation(`${BASE_URL}/jobs/${jobId}`, "PATCH", data)
  return res.json()
}

/**
 * Calls `DELETE /jobs/:id` on Express (Protected: Owning Recruiter or Admin).
 * Permanently removes the job post from MongoDB.
 */
export const deleteJob = async (jobId: string) => {
  const res = await protectedMutation(`${BASE_URL}/jobs/${jobId}`, "DELETE")
  return res.json()
}
