/**
 * ==============================================================================
 * FILE: client/components/auth-form.tsx
 * ==============================================================================
 * PURPOSE:
 *   Shared dark-mode Authentication Form used by BOTH `/sign-in` and `/sign-up`.
 *   IMPORTANT:
 *     - ONLY shows TWO role options: **Job Seeker** and **Recruiter** on BOTH
 *       Sign In and Sign Up!
 *     - Admin login is intentionally NOT shown here — administrators sign in via
 *       the dedicated passwordless Email OTP route at `/admin`.
 *     - Also supports "Continue with Google" OAuth.
 *
 * USED BY:
 *   - `client/app/(auth)/sign-in/SignInContent.tsx`
 *   - `client/app/(auth)/sign-up/page.tsx`
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, Trash2, Upload, User, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { PillGroup } from "@/components/shared/pill-group"
import type { UserRole } from "@/lib/types/user"

export type { UserRole }

export type AuthMode = "signin" | "signup"

export type AuthFormData = {
  email: string
  password: string
  name?: string
  role: "seeker" | "recruiter"
  image?: string
}

const COPY = {
  signin: {
    title: "Welcome back",
    subtitle: "Select Job Seeker or Recruiter and sign in to your workspace.",
    roleLegend: "Signing in as",
    submitLabel: "Sign In",
    showName: false,
    footer: "New to HireLoop?",
    footerLinkHref: "/sign-up",
    footerLinkLabel: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Choose Job Seeker or Recruiter to get started in seconds.",
    roleLegend: "Joining HireLoop as",
    submitLabel: "Sign Up",
    showName: true,
    footer: "Already have an account?",
    footerLinkHref: "/sign-in",
    footerLinkLabel: "Sign in",
  },
} as const

const inputClass =
  "h-12 w-full rounded-lg border surface-field pl-10 pr-3 text-base tracking-[-0.0125rem] text-[#EDEDEF] shadow-[inset_0_3px_10px_rgba(255,255,255,0.04)] outline-none transition-colors placeholder:text-white/50 focus:ring-2 focus:ring-[#5C53FE]/30"
const labelClass = "mb-2 block text-left text-sm text-[#EDEDEF]/80"

// Two public roles offered on both Sign In and Sign Up (Admin uses `/admin` OTP only)
const ROLES: {
  value: "seeker" | "recruiter"
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "seeker", label: "Job Seeker", icon: Users },
  { value: "recruiter", label: "Recruiter", icon: User },
]

export function AuthForm({
  mode,
  onSubmit,
  onGoogleSignIn,
  error,
  loading = false,
}: {
  mode: AuthMode
  onSubmit?: (data: AuthFormData) => void | Promise<void>
  onGoogleSignIn?: (role: "seeker" | "recruiter") => void | Promise<void>
  error?: string | null
  loading?: boolean
}) {
  const copy = COPY[mode]
  const isSignup = mode === "signup"

  const [values, setValues] = React.useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
    role: "seeker",
    image: undefined,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  // Uploads the selected photo to Cloudinary via `POST /api/upload` and stores
  // the permanent HTTPS CDN URL (`https://res.cloudinary.com/...`) in `values.image`.
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(null)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5MB or smaller.")
      return
    }

    // Show immediate local preview while Cloudinary uploads in the background
    const objectUrl = URL.createObjectURL(file)
    setImagePreview(objectUrl)
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "hireloop/avatars")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const result = await res.json()

      if (!res.ok || !result?.url) {
        setUploadError(result?.error || "Image upload failed. Please try again.")
        setImagePreview(null)
        setValues((prev) => ({ ...prev, image: undefined }))
        return
      }

      // Replace local preview with the real permanent Cloudinary CDN link!
      URL.revokeObjectURL(objectUrl)
      setImagePreview(result.url)
      setValues((prev) => ({ ...prev, image: result.url }))
    } catch {
      setUploadError("Network error while uploading image.")
      setImagePreview(null)
      setValues((prev) => ({ ...prev, image: undefined }))
    } finally {
      setUploadingImage(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setUploadError(null)
    setValues((prev) => ({ ...prev, image: undefined }))
  }

  const setField =
    (field: "email" | "password" | "name") =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data: AuthFormData = {
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      ...(isSignup ? { name: values.name?.trim(), image: values.image } : {}),
    }
    onSubmit?.(data)
  }

  return (
    <div className="surface-card w-full p-7 sm:p-8">
      <div className="mb-6 flex flex-col gap-1.5 text-center">
        <h1 className="page-title">{copy.title}</h1>
        <p className="text-sm leading-relaxed text-white/70">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Role Picker: Job Seeker vs Recruiter (shown on BOTH Sign In & Sign Up) */}
        <fieldset>
          <legend className={labelClass}>{copy.roleLegend}</legend>
          <PillGroup
            name="role"
            value={values.role}
            onChange={(role) => setValues((prev) => ({ ...prev, role }))}
            options={ROLES}
            className="grid grid-cols-2 gap-2"
            pillClassName="flex-col h-full w-full justify-center gap-1.5 px-2 py-3 tracking-[-0.0125rem]"
          />
        </fieldset>

        {/* Optional Profile Photo (Sign Up only) */}
        {copy.showName ? (
          <fieldset>
            <legend className={labelClass}>Profile photo (optional)</legend>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Selected profile photo preview"
                  className="size-11 shrink-0 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1F]"
                >
                  <User className="size-5 text-white/50" />
                </span>
              )}

              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#1A1A1F] px-3.5 text-xs text-[#EDEDEF]/80 transition-colors hover:border-white/25 hover:text-white">
                <Upload aria-hidden className="size-3.5" />
                {uploadingImage
                  ? "Uploading..."
                  : values.image
                  ? "Change photo"
                  : "Upload photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={uploadingImage}
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>

              {values.image && !uploadingImage ? (
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Remove selected image"
                  className="rounded-md p-2 text-white/50 transition-colors hover:text-white"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              ) : null}
            </div>
            {values.image ? (
              <p className="mt-1.5 truncate text-[11px] text-[#22C55E]">
                Uploaded to CDN: {values.image}
              </p>
            ) : null}
            {uploadError ? (
              <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>
            ) : null}
          </fieldset>
        ) : null}

        {/* Full Name (Sign Up only) */}
        {copy.showName ? (
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <div className="relative">
              <User
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
              />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={values.name ?? ""}
                onChange={setField("name")}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>
          </div>
        ) : null}

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={setField("email")}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            {!isSignup ? (
              <Link
                href="/forgot-password"
                className="mb-2 text-xs font-medium text-[#8B85FF] transition-colors hover:text-white"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <Lock
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-white/50"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              maxLength={72}
              value={values.password}
              onChange={setField("password")}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
              className={cn(inputClass, "pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-white/50 transition-colors hover:text-white"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="btn-brand mt-1 h-12 w-full rounded-lg text-base font-semibold text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] transition-colors disabled:opacity-60"
        >
          {uploadingImage
            ? "Uploading photo..."
            : loading
            ? "Please wait..."
            : `${copy.submitLabel} as ${values.role === "recruiter" ? "Recruiter" : "Job Seeker"}`}
        </button>

        {/* Google OAuth Button */}
        {onGoogleSignIn ? (
          <>
            <div className="relative my-1 flex items-center justify-center">
              <div className="h-px w-full bg-white/10" />
              <span className="bg-[#101010] px-3 text-xs uppercase text-[#6E6E78]">or</span>
              <div className="h-px w-full bg-white/10" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => onGoogleSignIn(values.role)}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-[#16161B] text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-[#1E1E24] disabled:opacity-60"
            >
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </p>
        ) : null}
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        {copy.footer}{" "}
        <Link
          href={copy.footerLinkHref}
          className="font-semibold text-[#8B85FF] transition-colors hover:text-white"
        >
          {copy.footerLinkLabel}
        </Link>
      </p>
    </div>
  )
}
