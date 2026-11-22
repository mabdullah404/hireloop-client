/**
 * ==============================================================================
 * FILE: client/app/admin/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Dedicated secret Admin Login route at `/admin` (all lowercase).
 *   - No Admin login button exists on `/sign-in` or the public homepage/footer.
 *   - Only someone navigating directly to `/admin` sees this passwordless Email
 *     OTP login interface.
 *   - If already signed in as `admin`, redirects immediately to `/dashboard/admin`.
 * ==============================================================================
 */

import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/core/server"
import { AdminOtpLogin } from "./_components/admin-otp-login"

export default async function AdminLoginPage() {
  const session = await getSession()

  // If already authenticated as Admin, go straight to the Admin Dashboard
  if (session?.user?.role === "admin") {
    redirect("/dashboard/admin")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07070A] px-4 py-12 text-[#EDEDEF]">
      {/* Subtle purple ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5C53FE]/15 blur-[140px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="HireLoop Home">
            <Image
              src="/logo.png"
              alt="HireLoop"
              width={150}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <AdminOtpLogin />
      </div>
    </div>
  )
}
