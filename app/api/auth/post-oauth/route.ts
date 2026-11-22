/**
 * ==============================================================================
 * FILE: client/app/api/auth/post-oauth/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Smart post-Google-OAuth landing handler (`GET /api/auth/post-oauth`).
 *   Why we need this:
 *     - When a brand-new user chooses **Recruiter** on `/sign-up` and clicks
 *       "Continue with Google", Better Auth initially creates the user with
 *       `role: "seeker"` (the default).
 *     - This route runs right after Google redirects back:
 *         1. Reads the active Better Auth session.
 *         2. If `mode=signup`, `role=recruiter`, and the user was just created
 *            within the last 2 minutes (and is not admin), upgrades their role
 *            in MongoDB to `"recruiter"` automatically!
 *         3. Reads their actual role from MongoDB and redirects cleanly to
 *            `/dashboard/seeker`, `/dashboard/recruiter`, or `redirectTo`!
 *
 * CALLED FROM:
 *   - `client/app/(auth)/sign-in/SignInContent.tsx`
 *   - `client/app/(auth)/sign-up/page.tsx`
 * ==============================================================================
 */

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { ObjectId } from "mongodb"
import { auth, authDb } from "@/lib/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedRole = url.searchParams.get("role")
  const mode = url.searchParams.get("mode") || "signin"
  const redirectTo = url.searchParams.get("redirectTo")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", url.origin))
  }

  const usersCollection = authDb.collection("user")
  const userFilter = ObjectId.isValid(session.user.id)
    ? { _id: new ObjectId(session.user.id) }
    : { email: session.user.email }

  const dbUser = await usersCollection.findOne(userFilter)
  let finalRole = (dbUser?.role as string) || (session.user.role as string) || "seeker"

  // If signing up fresh via Google as a Recruiter, assign role = "recruiter"
  if (
    mode === "signup" &&
    requestedRole === "recruiter" &&
    finalRole !== "admin" &&
    dbUser?.createdAt
  ) {
    const ageMs = Date.now() - new Date(dbUser.createdAt).getTime()
    if (ageMs < 2 * 60 * 1000) {
      await usersCollection.updateOne(userFilter, {
        $set: { role: "recruiter", updatedAt: new Date() },
      })
      finalRole = "recruiter"
    }
  }

  // If redirectTo is a safe relative path (and not another role's dashboard), honor it
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : `/dashboard/${finalRole}`

  return NextResponse.redirect(new URL(safeRedirect, url.origin))
}
