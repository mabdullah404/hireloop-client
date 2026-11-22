/**
 * ==============================================================================
 * FILE: client/lib/actions/users.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for Admin User Management CRUD.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - PATCH  http://localhost:5001/users/:id/role   -> updateUserRole()   [Admin]
 *   - PATCH  http://localhost:5001/users/:id/status -> updateUserStatus() [Admin]
 *   - DELETE http://localhost:5001/users/:id        -> deleteUser()       [Admin]
 *
 * USED BY:
 *   - `client/app/dashboard/admin/users/_components/users-table.tsx`
 * ==============================================================================
 */

"use server"

import { protectedMutation } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `PATCH /users/:id/role` to switch a user between seeker / recruiter / admin.
 */
export const updateUserRole = async (
  userId: string,
  role: "seeker" | "recruiter" | "admin"
) => {
  const response = await protectedMutation(`${BASE_URL}/users/${userId}/role`, "PATCH", { role })
  return response.json()
}

/**
 * Calls `PATCH /users/:id/status` to Suspend (`banned: true`) or Activate (`banned: false`) a user.
 */
export const updateUserStatus = async (userId: string, banned: boolean) => {
  const response = await protectedMutation(`${BASE_URL}/users/${userId}/status`, "PATCH", {
    banned,
  })
  return response.json()
}

/**
 * Calls `DELETE /users/:id` to permanently delete a user account.
 */
export const deleteUser = async (userId: string) => {
  const response = await protectedMutation(`${BASE_URL}/users/${userId}`, "DELETE")
  return response.json()
}
