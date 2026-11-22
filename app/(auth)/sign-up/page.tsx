/**
 * ==============================================================================
 * FILE: client/app/(auth)/sign-up/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Registration page where new users pick their role (`Job Seeker` or `Recruiter`)
 *   and create an account via Better Auth (`authClient.signUp.email`) or Google OAuth.
 *   Redirects straight to `/dashboard/seeker` or `/dashboard/recruiter` upon success!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthForm, type AuthFormData } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSignUp = async (data: AuthFormData) => {
    setError(null)
    setLoading(true)

    try {
      const selectedRole = data.role === "recruiter" ? "recruiter" : "seeker"

      const { error: signUpError } = await authClient.signUp.email({
        name: data.name || "HireLoop User",
        email: data.email,
        password: data.password,
        role: selectedRole,
        image: data.image,
      })

      if (signUpError) {
        setError(signUpError.message || "Could not create account. Please try again.")
        setLoading(false)
        return
      }

      router.refresh()
      router.push(`/dashboard/${selectedRole}`)
    } catch {
      setError("Something went wrong during sign up.")
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async (selectedRole: "seeker" | "recruiter") => {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams({ mode: "signup", role: selectedRole })
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `/api/auth/post-oauth?${params.toString()}`,
      })
    } catch {
      setError("Google sign-up could not be started.")
      setLoading(false)
    }
  }

  return (
    <AuthForm
      mode="signup"
      onSubmit={handleSignUp}
      onGoogleSignIn={handleGoogleSignUp}
      error={error}
      loading={loading}
    />
  )
}
