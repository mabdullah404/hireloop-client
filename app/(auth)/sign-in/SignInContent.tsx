/**
 * ==============================================================================
 * FILE: client/app/(auth)/sign-in/SignInContent.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Sign-In handler for **Job Seeker** and **Recruiter** accounts ONLY:
 *     - Users choose Job Seeker or Recruiter on the form and sign in with
 *       Email + Password or Google OAuth.
 *     - Verifies the account matches the selected role (blocks admin accounts
 *       from signing in via `/sign-in` — Admin must use `/admin` OTP flow).
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForm, type AuthFormData } from "@/components/auth-form"
import { authClient, signOut } from "@/lib/auth-client"

export default function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSignIn = async (data: AuthFormData) => {
    setError(null)
    setLoading(true)

    try {
      const { data: signInResponse, error: signInError } =
        await authClient.signIn.email({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })

      if (signInError) {
        setError(signInError.message || "Invalid email or password.")
        setLoading(false)
        return
      }

      const accountRole =
        (signInResponse?.user as { role?: string } | undefined)?.role || "seeker"

      // Admin accounts must sign in exclusively through `/admin` passwordless OTP
      if (accountRole === "admin") {
        await signOut()
        setError("Please use the dedicated Admin verification portal to sign in.")
        setLoading(false)
        return
      }

      // Ensure user selected the matching role (Job Seeker vs Recruiter)
      if (accountRole !== data.role) {
        await signOut()
        const expectedLabel = accountRole === "recruiter" ? "Recruiter" : "Job Seeker"
        setError(
          `This email is registered as a ${expectedLabel}. Please select "${expectedLabel}" above and try again.`
        )
        setLoading(false)
        return
      }

      router.refresh()
      router.push(redirectTo || `/dashboard/${accountRole}`)
    } catch {
      setError("Something went wrong while signing in. Please try again.")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async (selectedRole: "seeker" | "recruiter") => {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams({ mode: "signin", role: selectedRole })
      if (redirectTo) params.set("redirectTo", redirectTo)

      await authClient.signIn.social({
        provider: "google",
        callbackURL: `/api/auth/post-oauth?${params.toString()}`,
      })
    } catch {
      setError("Google sign-in could not be started.")
      setLoading(false)
    }
  }

  return (
    <AuthForm
      mode="signin"
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      error={error}
      loading={loading}
    />
  )
}
