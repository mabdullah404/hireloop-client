/**
 * ==============================================================================
 * FILE: client/app/(auth)/forgot-password/_components/forgot-password-form.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive 2-step Password Recovery UI for Job Seekers & Recruiters:
 *     - Step 1: Enter account email -> `POST /api/auth/forgot-password/send`
 *     - Step 2: Enter 6-digit Gmail code + New Password + Confirm Password ->
 *       `POST /api/auth/forgot-password/reset` -> redirects to `/sign-in`!
 *   Also auto-reads `?email=...&code=...` if the user clicked the button in Gmail!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
} from "lucide-react"

import { toast } from "@/components/ui/toast"

const inputClass =
  "h-12 w-full rounded-lg border surface-field pl-10 pr-3 text-base tracking-[-0.0125rem] text-[#EDEDEF] shadow-[inset_0_3px_10px_rgba(255,255,255,0.04)] outline-none transition-colors placeholder:text-white/50 focus:ring-2 focus:ring-[#5C53FE]/30"

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const prefilledEmail = searchParams.get("email") || ""
  const prefilledCode = (searchParams.get("code") || "").replace(/\D/g, "").slice(0, 6)

  const [step, setStep] = React.useState<"email" | "reset">(
    prefilledEmail && prefilledCode.length === 6 ? "reset" : "email"
  )
  const [email, setEmail] = React.useState(prefilledEmail)
  const [code, setCode] = React.useState(prefilledCode)
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [infoMsg, setInfoMsg] = React.useState<string | null>(
    prefilledCode.length === 6
      ? "Reset code detected from your email link. Choose a new password below."
      : null
  )
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Step 1: Send 6-digit password reset code via Gmail Nodemailer
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setInfoMsg(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Could not send reset code.")
        setLoading(false)
        return
      }

      setStep("reset")
      setCooldown(30)
      setInfoMsg(json.message || `Reset code sent to ${email.trim()}.`)
      toast.add({
        title: "Reset code sent",
        description: `Check your Gmail (${email.trim()}) for the 6-digit code.`,
      })
    } catch {
      setError("Network error while sending reset code.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-digit code and save new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanCode = code.replace(/\D/g, "")
    if (cleanCode.length !== 6) {
      setError("Please enter the 6-digit reset code from your email.")
      return
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: cleanCode,
          newPassword,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Could not reset password.")
        setLoading(false)
        return
      }

      toast.add({
        title: "Password updated!",
        description: "You can now sign in with your new password.",
      })
      router.push("/sign-in")
    } catch {
      setError("Network error while resetting password.")
      setLoading(false)
    }
  }

  return (
    <div className="surface-card w-full p-7 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-[#5C53FE]/40 bg-[#5C53FE]/15 text-[#8F88FF]">
          <KeyRound className="size-6" />
        </div>
        <h1 className="page-title">
          {step === "email" ? "Forgot password?" : "Set new password"}
        </h1>
        <p className="mt-1.5 text-sm text-white/70">
          {step === "email"
            ? "Enter your Job Seeker or Recruiter email and we'll send you a 6-digit reset code."
            : "Enter the 6-digit code from your email and choose a new password."}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-2 block text-sm text-[#EDEDEF]/80">
              Email address
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
              />
              <input
                id="reset-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand h-12 w-full rounded-lg text-base font-semibold text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] disabled:opacity-60"
          >
            {loading ? "Sending reset code..." : "Send Reset Code"}
          </button>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {infoMsg ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-3.5 py-3 text-xs text-[#86EFAC]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#22C55E]" />
              <span>{infoMsg}</span>
            </div>
          ) : null}

          <div>
            <label htmlFor="reset-code" className="mb-2 block text-sm text-[#EDEDEF]/80">
              6-Digit Reset Code
            </label>
            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="surface-field h-12 w-full rounded-lg border px-4 text-center font-mono text-xl font-bold tracking-[0.35em] text-white outline-none focus:ring-2 focus:ring-[#5C53FE]/30"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm text-[#EDEDEF]/80">
              New Password
            </label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
              />
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                maxLength={72}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm text-[#EDEDEF]/80">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
              />
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                maxLength={72}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand h-12 w-full rounded-lg text-base font-semibold text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Reset Password"}
          </button>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email")
                setError(null)
              }}
              className="inline-flex items-center gap-1 text-[#A1A4AA] hover:text-white"
            >
              <ArrowLeft className="size-3.5" /> Change email
            </button>
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => handleSendCode()}
              className="inline-flex items-center gap-1 font-medium text-[#8F88FF] hover:text-white disabled:opacity-50"
            >
              <RefreshCw className="size-3.5" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/70">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-[#8B85FF] transition-colors hover:text-white"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  )
}
