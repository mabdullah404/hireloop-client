/**
 * ==============================================================================
 * FILE: client/components/site-footer.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public site footer matching Figma's `Design / Homepage` Footer frame:
 *     - HireLoop logo + tagline
 *     - 3 link columns (Product, Navigations, Resources) with `#5C53FE` titles
 *     - Bottom divider + copyright & policy links
 *
 * USED BY:
 *   - `client/app/page.tsx`
 *   - `client/app/browse-jobs/page.tsx`
 *   - `client/app/company/page.tsx`
 *   - `client/app/pricing/page.tsx`
 * ==============================================================================
 */

import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#010103] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="HireLoop"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#A1A4AA]">
              The AI-native career platform. Built for people who take their work
              seriously.
            </p>
          </div>

          {/* Product column */}
          <div className="md:col-span-2">
            <h3 className="text-base font-medium text-[#5C53FE]">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#D0D5DD]">
              <li>
                <Link href="/browse-jobs" className="transition-colors hover:text-white">
                  Job discovery
                </Link>
              </li>
              <li>
                <Link href="/company" className="transition-colors hover:text-white">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-white">
                  Pricing &amp; Pro
                </Link>
              </li>
              <li>
                <Link href="/browse-jobs?sort=salary_desc" className="transition-colors hover:text-white">
                  Salary data
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigations column */}
          <div className="md:col-span-3">
            <h3 className="text-base font-medium text-[#5C53FE]">Navigations</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#D0D5DD]">
              <li>
                <Link href="/sign-up" className="transition-colors hover:text-white">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="transition-colors hover:text-white">
                  Sign in to workspace
                </Link>
              </li>
              <li>
                <Link href="/dashboard/seeker" className="transition-colors hover:text-white">
                  Job Seeker Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/recruiter" className="transition-colors hover:text-white">
                  Recruiter Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources column */}
          <div className="md:col-span-2">
            <h3 className="text-base font-medium text-[#5C53FE]">Resources</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#D0D5DD]">
              <li>
                <Link href="/checkout?plan=pro" className="transition-colors hover:text-white">
                  Upgrade to Pro
                </Link>
              </li>
              <li>
                <Link href="/browse-jobs?isRemote=true" className="transition-colors hover:text-white">
                  Remote Roles
                </Link>
              </li>
              <li>
                <Link href="/browse-jobs" className="transition-colors hover:text-white">
                  Browse All Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#ACABB2] sm:flex-row">
          <p>Copyright {new Date().getFullYear()} — HireLoop Career Platform</p>
          <p>Terms &amp; Policy - Privacy Guideline</p>
        </div>
      </div>
    </footer>
  )
}
