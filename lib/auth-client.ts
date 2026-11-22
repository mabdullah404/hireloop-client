/**
 * ==============================================================================
 * FILE: client/lib/auth-client.ts
 * ==============================================================================
 * PURPOSE:
 *   Browser-side (React Client Component) authentication helper created by Better Auth.
 *   Gives client components hooks & functions like:
 *     - `useSession()` -> React hook to check who is currently logged in
 *     - `signIn.email()` / `signIn.social({ provider: "google" })` -> log in
 *     - `signUp.email()` -> register as Job Seeker or Recruiter
 *     - `signOut()` -> log out and clear cookies
 *
 * USED BY:
 *   - `client/components/site-navbar.tsx` (shows user avatar / Sign Out)
 *   - `client/app/components/DashboardSidebar.tsx` (shows role sidebar + Sign Out)
 *   - `client/app/(auth)/sign-in/SignInContent.tsx` (Email, Google & Static Admin login)
 *   - `client/app/(auth)/sign-up/page.tsx` (Seeker / Recruiter registration)
 * ==============================================================================
 */

import type { auth } from "@/lib/auth"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Uses same-origin `/api/auth` automatically in browser, or NEXT_PUBLIC_BETTER_AUTH_URL if set
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
  // Pulls TypeScript types for `role`, `banned`, `premium`, `plan` directly from `lib/auth.ts`
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = authClient
