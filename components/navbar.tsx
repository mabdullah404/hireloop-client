"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
// ১. আপনার auth-client.ts থেকে সরাসরি signOut এবং useSession ইম্পোর্ট করা হলো
import { signOut, useSession } from "@/lib/auth-client"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // ২. useSession() দিয়ে লগইন সেশন ও লোডিং স্টেট নেওয়া হচ্ছে
  const { data: session, isPending } = useSession()

  // ইউজারের রোল অনুযায়ী সঠিক ড্যাশবোর্ড লিংক নির্ধারণ (ডিফল্ট seeker)
  const userRole = (session?.user as { role?: string })?.role || "seeker"
  const dashboardUrl = `/dashboard/${userRole}`

  // ৩. signOut() ফাংশন দিয়ে সাইন আউট হ্যান্ডলার
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  // ড্যাশবোর্ডের রুটে পাবলিক নেভবার হাইড রাখা হবে (কারণ ড্যাশবোর্ডের নিজস্ব সাইডবার ও হেডার আছে)
  if (pathname.startsWith("/dashboard")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#030308]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="HireLoop"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="text-white hover:bg-white/10"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Menu Links & Right Actions */}
        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row w-full md:w-auto items-center gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0`}
        >
          {/* Navigation Links */}
          <Link
            href="/jobs"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Browse Jobs
          </Link>
          <Link
            href="/companies"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Company
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          {/* Dashboard Link */}
          <Link
            href={dashboardUrl}
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>

          {/* Vertical Divider (Only on desktop) */}
          <div className="hidden md:block w-px h-4 bg-white/20" />

          {/* --- কন্ডিশনাল রেন্ডারিং (useSession ও signOut দিয়ে) --- */}
          {isPending ? (
            <div className="h-8 w-24 rounded-lg bg-white/5 animate-pulse" />
          ) : session ? (
            /* ১. ইউজার লগইন করা থাকলে: Dashboard বাটন, Welcome {name} ও Sign Out বাটন */
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
              <Link
                href={dashboardUrl}
                onClick={() => setIsOpen(false)}
                className="w-full md:w-auto"
              >
                <Button
                  size="sm"
                  className="w-full md:w-auto bg-[#5C53FE] hover:bg-[#4D44EE] text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-[#5C53FE]/30 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="size-7 rounded-full bg-[#5C53FE]/20 border border-[#5C53FE]/40 flex items-center justify-center text-[#5C53FE]">
                  <User className="size-3.5" />
                </div>
                <span>
                  Welcome,{" "}
                  <span className="font-semibold text-white">
                    {session.user.name}
                  </span>
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full md:w-auto text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            /* ২. ইউজার লগইন না করা থাকলে: Sign In ও Get Started বাটন */
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto pt-2 md:pt-0">
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="text-sm font-normal text-white hover:text-gray-300 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsOpen(false)}
                className="w-full md:w-auto"
              >
                <Button
                  size="sm"
                  className="w-full md:w-auto bg-[#5C53FE] hover:bg-[#4D44EE] text-white px-5 rounded-lg text-sm font-medium shadow-md shadow-[#5C53FE]/30 transition-all cursor-pointer"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
