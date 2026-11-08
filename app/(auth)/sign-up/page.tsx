"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Building2,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

const ROLES = [
  { value: "seeker", label: "Seeker", icon: User },
  { value: "recruiter", label: "Recruiter", icon: Building2 },
  { value: "admin", label: "Admin", icon: ShieldCheck },
]

export default function SignUpPage() {
  const router = useRouter()

  // ১. ইনপুট ফিল্ড ও রোল রাখার স্টেট (ডিফল্ট: seeker)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
  })

  // ২. পাসওয়ার্ড শো/হাইড স্টেট
  const [showPassword, setShowPassword] = useState(false)

  // ৩. লোডিং এবং এরর স্টেট
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // ইনপুট পরিবর্তনের হ্যান্ডলার
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // ৪. ফর্ম সাবমিট হ্যান্ডলার — Better Auth-এ role সহ ডেটা পাঠানো
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      // Better Auth দিয়ে MongoDB ডেটাবেজে ইউজার সাইন আপ (role সহ)
      const { data, error } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role, // 👉 এখানে ইউজারের সিলেক্ট করা রোল পাঠানো হচ্ছে
        callbackURL: "/",
      } as Parameters<typeof authClient.signUp.email>[0] & { role: string })

      if (error) {
        setErrorMessage(error.message || "Failed to create account. Please try again.")
        setLoading(false)
        return
      }

      console.log("User created successfully with role:", data)

      // সফল হলে হোমপেজে পাঠানো হচ্ছে
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Something went wrong. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[#030308] text-white">
      {/* Background Subtle Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#5C53FE]/15 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Auth Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0a12]/90 p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.png"
                alt="HireLoop Logo"
                width={120}
                height={32}
                className="h-8 w-auto mx-auto"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Join HireLoop to discover top opportunities
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* Chrome autofill prevention hidden dummy fields */}
            <input type="text" name="prevent_autofill_email" className="hidden" tabIndex={-1} autoComplete="off" />
            <input type="password" name="prevent_autofill_pwd" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Role Selection (Seeker / Recruiter / Admin) */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Join as
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((item) => {
                  const Icon = item.icon
                  const isSelected = formData.role === item.value

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: item.value })
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#5C53FE] bg-[#5C53FE]/20 text-white shadow-md shadow-[#5C53FE]/20"
                          : "border-white/10 bg-[#12121d] text-gray-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <Icon className={`size-4 mb-1 ${isSelected ? "text-[#5C53FE]" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-[#12121d] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#5C53FE] transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-[#12121d] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#5C53FE] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-[#12121d] pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#5C53FE] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5C53FE] hover:bg-[#4D44EE] text-white py-2.5 rounded-xl font-medium shadow-md shadow-[#5C53FE]/25 mt-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle to Sign In */}
          <div className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-[#5C53FE] font-semibold hover:underline ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
