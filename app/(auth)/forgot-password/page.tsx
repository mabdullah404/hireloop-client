/**
 * ==============================================================================
 * FILE: client/app/(auth)/forgot-password/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Forgot Password route (`/forgot-password`) for Job Seekers & Recruiters.
 *   Uses the same dark auth shell as `/sign-in` and `/sign-up`.
 * ==============================================================================
 */

import { Suspense } from "react"
import { ForgotPasswordForm } from "./_components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="surface-card w-full p-8 text-center text-sm text-[#A1A4AA]">
          Loading password recovery...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
