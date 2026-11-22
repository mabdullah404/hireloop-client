/**
 * ==============================================================================
 * FILE: client/lib/actions/applications.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for modifying or deleting Job Applications.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - PATCH  http://localhost:5001/applications/:id -> updateApplicationStatus()   [Recruiter/Admin]
 *   - PATCH  http://localhost:5001/applications/:id -> toggleArchiveApplication()  [Seeker/Admin]
 *   - DELETE http://localhost:5001/applications/:id -> deleteApplication()         [Seeker/Admin]
 *
 * USED BY:
 *   - `client/app/dashboard/recruiter/jobs/[id]/applications/_components/applications-review-table.tsx`
 *   - `client/app/dashboard/recruiter/applications/page.tsx`
 *   - `client/app/dashboard/recruiter/page.tsx`
 *   - `client/app/dashboard/seeker/applications/_components/applications-board.tsx`
 * ==============================================================================
 */

"use server"

import { protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `PATCH /applications/:id` with `{ status }` (Recruiter or Admin).
 * Updates candidate status: applied -> review -> shortlisted -> interview -> offered / rejected.
 */
export const updateApplicationStatus = async (id: string, data: { status: string }) => {
  const response = await protectedMutation(`${BASE_URL}/applications/${id}`, "PATCH", data)
  return response.json()
}

/**
 * Calls `PATCH /applications/:id` with `{ archived }` (Seeker or Admin).
 * Moves an application between the Active and Archived tabs in "My Applications".
 */
export const toggleArchiveApplication = async (id: string, archived: boolean) => {
  const response = await protectedMutation(`${BASE_URL}/applications/${id}`, "PATCH", { archived })
  return response.json()
}

/**
 * Calls `DELETE /applications/:id` (Seeker or Admin).
 * Withdraws an application and decrements the job's applicant count.
 */
export const deleteApplication = async (id: string) => {
  const response = await protectedMutation(`${BASE_URL}/applications/${id}`, "DELETE")
  return response.json()
}
