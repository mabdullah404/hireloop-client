/**
 * ==============================================================================
 * FILE: client/components/site-navbar.tsx
 * ==============================================================================
 * PURPOSE:
 *   Top floating glass/dark navigation bar used across ALL public pages
 *   (Homepage, Browse Jobs, Job Details, Companies, Pricing, Checkout Success).
 *
 * HOW AUTH STATE WORKS HERE:
 *   Uses `useSession()` from `client/lib/auth-client.ts` to inspect who is logged in:
 *     - Guest: Shows "Sign In" and "Get Started" buttons.
 *     - Logged-in user: Shows a direct "Dashboard" link tailored to their role
 *       (`/dashboard/seeker`, `/dashboard/recruiter`, or `/dashboard/admin`),
 *       their avatar, name, and a "Sign Out" button.
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSession, signOut } from "@/lib/auth-client"

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { data: session } = useSession()

  const dashboardHref = session?.user?.role
    ? `/dashboard/${session.user.role}`
    : "/dashboard/seeker"

  const navLinks = [
    { label: "Browse Jobs", href: "/browse-jobs" },
    { label: "Company", href: "/company" },
    { label: "Pricing", href: "/pricing" },
    ...(session?.user ? [{ label: "Dashboard", href: dashboardHref }] : []),
  ]

  React.useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    router.refresh()
    router.push("/")
  }

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        {/* HireLoop Logo */}
        <Link href="/" aria-label="HireLoop home" className="block shrink-0">
          <Image
            src="/logo.png"
            alt="HireLoop"
            width={160}
            height={44}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        {/* Desktop Pill Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden h-[64px] items-center gap-6 rounded-xl border border-white/10 bg-[#1A1A1F]/95 px-6 backdrop-blur-md lg:flex"
        >
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/")

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-white",
                      active
                        ? "font-semibold text-white underline underline-offset-4"
                        : "text-[#EDEDEF]/85"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div aria-hidden className="h-5 w-px bg-white/15" />

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
                >
                  <UserAvatar
                    src={session.user.image}
                    name={session.user.name}
                    className="size-8"
                  />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="max-w-[130px] truncate text-sm font-medium text-[#EDEDEF]">
                      {session.user.name}
                    </span>
                    <span className="text-[11px] capitalize text-[#8F88FF]">
                      {session.user.role || "seeker"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#A1A4AA] transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#8F88FF] transition-colors hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-10 items-center rounded-lg bg-[#5C53FE] px-5 text-sm font-medium text-white shadow-[inset_0_3px_10px_rgba(255,255,255,0.2)] transition-colors hover:bg-[#7B74FF]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-controls="site-navbar-mobile"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="size-11 rounded-lg border border-white/10 bg-[#1A1A1F] text-[#EDEDEF] hover:bg-white/5 hover:text-white lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Dropdown Panel */}
      {open ? (
        <div
          id="site-navbar-mobile"
          className="mx-auto mt-3 flex max-w-7xl flex-col gap-3 rounded-xl border border-white/10 bg-[#1A1A1F] p-4 shadow-xl lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base transition-colors hover:bg-white/5 hover:text-white",
                      active ? "font-bold text-white" : "text-[#EDEDEF]/90"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div aria-hidden className="h-px w-full bg-white/10" />

          {session?.user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  src={session.user.image}
                  name={session.user.name}
                  className="size-8"
                />
                <span className="text-sm font-medium text-white">{session.user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#A1A4AA] hover:text-white"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center rounded-lg border border-white/10 text-base font-semibold text-[#8F88FF]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center rounded-lg bg-[#5C53FE] text-base font-medium text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  )
}
