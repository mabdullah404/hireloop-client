/**
 * ==============================================================================
 * FILE: client/lib/api/user.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for fetching users, checking premium status,
 *   and reading/updating the logged-in user's own profile settings.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET   http://localhost:5001/users              -> getUsers()            [Admin]
 *   - GET   http://localhost:5001/users/me           -> getMyProfile()        [Auth]
 *   - PATCH http://localhost:5001/users/me/profile   -> updateMyProfile(data) [Auth]
 *   - GET   http://localhost:5001/users/:id/premium  -> getUserPremiumStatus  [Public]
 *
 * USED BY:
 *   - `client/app/dashboard/admin/users/page.tsx`
 *   - `client/app/dashboard/seeker/settings/page.tsx` & `billing/page.tsx`
 *   - `client/app/dashboard/recruiter/settings/page.tsx`
 *   - `client/app/browse-jobs/[id]/page.tsx`
 * ==============================================================================
 */

"use server"

import { authFetch, protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

export type UserProfileData = {
  _id: string
  name: string
  email: string
  image: string
  role: "seeker" | "recruiter" | "admin"
  banned: boolean
  premium: boolean
  plan: string
  headline: string
  bio: string
  skills: string[]
  resumeName: string
  resumeUrl: string
  resumeUpdatedAt: string | null
  createdAt: string
}

/**
 * Calls `GET /users` (Admin only) to list all registered accounts on HireLoop.
 */
export const getUsers = async () => {
  const res = await authFetch(`${BASE_URL}/users`)
  return res.json()
}

/**
 * Calls `GET /users/me` (Any logged-in user) to load profile, skills, bio, resume, and plan.
 */
export const getMyProfile = async (): Promise<UserProfileData | null> => {
  try {
    const res = await authFetch(`${BASE_URL}/users/me`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Calls `PATCH /users/me/profile` to save changes from Seeker or Recruiter Settings pages.
 */
export const updateMyProfile = async (
  data: Partial<
    Pick<
      UserProfileData,
      "name" | "image" | "headline" | "bio" | "skills" | "resumeName" | "resumeUrl" | "resumeUpdatedAt"
    >
  >
) => {
  const res = await protectedMutation(`${BASE_URL}/users/me/profile`, "PATCH", data)
  return res.json()
}

/**
 * Calls `GET /users/:id/premium` to check if a user has upgraded to Pro/Premium.
 */
export const getUserPremiumStatus = async (userId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/premium`, { cache: "no-store" })
    if (!res.ok) return { premium: false, plan: "starter" }
    return res.json()
  } catch {
    return { premium: false, plan: "starter" }
  }
}
