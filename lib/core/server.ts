/**
 * ==============================================================================
 * FILE: client/lib/core/server.ts
 * ==============================================================================
 * PURPOSE:
 *   Server-side security & API helper utilities used inside Next.js Server Components
 *   and Server Actions (`"use server"`).
 *
 * WHY THIS FILE IS SO IMPORTANT:
 *   1. `getSession()` reads the logged-in user's Better Auth session from HTTP cookies.
 *   2. `getToken()` extracts the secret session token string to send to Express.
 *   3. `authFetch()` calls Express GET APIs with `Authorization: Bearer <token>`.
 *   4. `protectedMutation()` calls Express POST/PUT/PATCH/DELETE APIs with the token.
 *   5. `requireRole("seeker" | "recruiter" | "admin")` blocks unauthorized users from
 *      opening another role's dashboard pages!
 *
 * USED BY:
 *   - Every `client/lib/api/*.ts` and `client/lib/actions/*.ts` file
 *   - `client/app/dashboard/seeker/layout.tsx`
 *   - `client/app/dashboard/recruiter/layout.tsx`
 *   - `client/app/dashboard/admin/layout.tsx`
 * ==============================================================================
 */

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Reads the current logged-in user session on the Next.js server.
 * Returns `null` if the visitor is not signed in.
 */
export const getSession = async () => {
  "use server"
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

/**
 * Extracts the Better Auth session token string for Express API calls.
 * If the user is not logged in, automatically redirects them to `/sign-in`.
 */
export const getToken = async () => {
  const session = await getSession()
  if (!session || !session.session?.token) {
    redirect("/sign-in")
  }
  return session.session.token
}

/**
 * Sends an authenticated GET request to the Express backend (`http://localhost:5000`).
 * Automatically attaches `Authorization: Bearer <token>` and disables stale caching.
 */
export const authFetch = async (api: string) => {
  const token = await getToken()
  const res = await fetch(api, {
    cache: "no-store",
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 401 || res.status === 403) {
    redirect("/unauthorized")
  }
  return res
}

/**
 * Sends an authenticated POST / PUT / PATCH / DELETE request to Express.
 * Automatically attaches JSON headers and `Authorization: Bearer <token>`.
 */
export const protectedMutation = async (
  api: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" | string,
  data?: unknown
) => {
  const token = await getToken()
  const res = await fetch(api, {
    method,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })
  return res
}

/**
 * Route guard called inside dashboard `layout.tsx` files.
 * Example: `await requireRole("admin")` in `app/dashboard/admin/layout.tsx`
 * ensures ONLY users with `role === "admin"` can open any `/dashboard/admin/*` page.
 */
export const requireRole = async (role: "seeker" | "recruiter" | "admin") => {
  const session = await getSession()
  if (!session) {
    // Admin uses the dedicated passwordless OTP portal at `/admin`; seekers & recruiters use `/sign-in`
    if (role === "admin") {
      redirect("/admin")
    }
    redirect(`/sign-in?redirectTo=/dashboard/${role}`)
  }
  if (session.user.banned) {
    redirect("/unauthorized")
  }
  if (session.user.role !== role) {
    redirect("/unauthorized")
  }
  return session
}
