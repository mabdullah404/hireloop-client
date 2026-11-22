/**
 * ==============================================================================
 * FILE: client/app/admin/_components/admin-otp-login.tsx
 * ==============================================================================
 * PURPOSE:
 *   Passwordless 2-Step Admin Email OTP Login UI rendered ONLY at `/admin`:
 *     - Step 1 (Email): Admin enters their authorized email -> clicks "Send Code".
 *       Calls `POST /api/auth/admin-otp/send` which sends a styled 6-digit OTP email
 *       via Nodemailer (Gmail SMTP).
 *     - Step 2 (OTP): Admin enters (or pastes) the 6-digit code from Gmail ->
 *       clicks "Verify & Login". Calls `POST /api/auth/admin-otp/verify` which
 *       validates the code, issues a real Better Auth session cookie, and routes
 *       straight into `/dashboard/admin`!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw, ShieldCheck } from "lucide-react"

import { toast } from "@/components/ui/toast"

export function AdminOtpLogin() {
  const router = useRouter()

  const [step, setStep] = React.useState<"email" | "otp">("email")
  const [email, setEmail] = React.useState("")
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [infoMsg, setInfoMsg] = React.useState<string | null>(null)
  const [cooldown, setCooldown] = React.useState(0)

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  // Countdown timer for "Resend Code" button
  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  // Step 1: Request 6-digit OTP email via Nodemailer
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setInfoMsg(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/admin-otp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Could not send verification code.")
        setLoading(false)
        return
      }

      setStep("otp")
      setDigits(["", "", "", "", "", ""])
      setCooldown(30)
      setInfoMsg(json.message || `Verification code sent to ${email.trim()}.`)
      toast.add({
        title: "Verification code sent",
        description: `Check your inbox (${email.trim()}) for the 6-digit code.`,
      })
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } catch {
      setError("Network error while sending code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle single digit typing & auto-advance to next box
  const handleDigitChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "")
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ""
        return next
      })
      return
    }

    // If user pasted multiple digits directly into one box, fill across boxes
    if (cleaned.length > 1) {
      const next = [...digits]
      for (let i = 0; i < 6 && i < cleaned.length; i++) {
        next[i] = cleaned[i]
      }
      setDigits(next)
      const focusIndex = Math.min(cleaned.length, 5)
      inputRefs.current[focusIndex]?.focus()
      return
    }

    setDigits((prev) => {
      const next = [...prev]
      next[index] = cleaned
      return next
    })
    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = ["", "", "", "", "", ""]
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // Step 2: Verify the 6-digit OTP & create a real Better Auth Admin session
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join("")
    if (code.length !== 6) {
      setError("Please enter all 6 digits from your email.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/admin-otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Invalid or expired verification code.")
        setLoading(false)
        return
      }

      toast.add({
        title: "Admin verified",
        description: "Welcome to the HireLoop Admin Console.",
      })
      router.refresh()
      router.push(json.redirectTo || "/dashboard/admin")
    } catch {
      setError("Network error while verifying code. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="surface-card w-full p-7 sm:p-8">
      {/* Header Badge + Title */}
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-[#5C53FE]/40 bg-[#5C53FE]/15 text-[#8F88FF]">
          {step === "email" ? (
            <ShieldCheck className="size-6" />
          ) : (
            <KeyRound className="size-6" />
          )}
        </div>

        <p className="overline-label">Restricted Access</p>
        <h1 className="page-title mt-1.5">Admin Console</h1>
        <p className="mt-2 text-sm text-[#A1A4AA]">
          {step === "email"
            ? "Enter the authorized administrator email to receive a 6-digit one-time login code."
            : "Enter the 6-digit security code we just emailed to your inbox."}
        </p>
      </div>

      {/* STEP 1: EMAIL INPUT */}
      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-left text-sm text-[#EDEDEF]/85"
            >
              Administrator Email
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-white/45"
              />
              <input
                id="admin-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter authorized admin email"
                className="surface-field h-12 w-full rounded-lg border pl-11 pr-3.5 text-sm text-[#EDEDEF] outline-none placeholder:text-white/45 focus:ring-2 focus:ring-[#5C53FE]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand h-12 w-full rounded-lg text-sm font-semibold text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] transition-colors disabled:opacity-60"
          >
            {loading ? "Sending verification code..." : "Send Code"}
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
        /* STEP 2: 6-DIGIT OTP VERIFICATION */
        <form onSubmit={handleVerifyCode} className="space-y-5">
          {infoMsg ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-3.5 py-3 text-xs text-[#86EFAC]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#22C55E]" />
              <span>{infoMsg}</span>
            </div>
          ) : null}

          <div>
            <label className="mb-3 block text-center text-xs font-medium tracking-wider text-[#A1A4AA] uppercase">
              Enter 6-Digit Verification Code
            </label>
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`Verification code digit ${index + 1}`}
                  className="surface-field h-14 w-full rounded-xl border text-center font-mono text-2xl font-bold text-white outline-none transition-all focus:border-[#5C53FE] focus:ring-2 focus:ring-[#5C53FE]/40"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || digits.join("").length !== 6}
            className="btn-brand h-12 w-full rounded-lg text-sm font-semibold text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying code..." : "Verify & Login"}
          </button>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}

          {/* Resend / Change Email Footer */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("email")
                setError(null)
                setInfoMsg(null)
              }}
              className="inline-flex items-center gap-1 text-[#A1A4AA] transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3.5" />
              Change email
            </button>

            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => handleSendCode()}
              className="inline-flex items-center gap-1 font-medium text-[#8F88FF] transition-colors hover:text-white disabled:opacity-50"
            >
              <RefreshCw className="size-3.5" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
