/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Job Seeker Dashboard Overview matching Figma `Seeker / Dashboard`:
 *     - Top Search Bar ("Search for opportunities...") -> routes to `/dashboard/seeker/jobs`
 *     - 4-card Stats Row: Saved Jobs, Applications Submitted, Interviews Scheduled, Offers Received
 *     - Recent Activity feed (live updates from applications + newest active job alerts)
 *     - Quick Action buttons to explore jobs or update resume
 *
 * API CALLS MADE HERE:
 *   - `getSeekerStats()` -> `GET http://localhost:5000/dashboard/seeker/stats`
 * ==============================================================================
 */

import Link from "next/link"
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  CalendarCheck,
  FileText,
  Search,
  Trophy,
} from "lucide-react"

import { PageContainer } from "@/components/dashboard/page-shell"
import { getSession } from "@/lib/core/server"
import { getSeekerStats } from "@/lib/api/dashboard"
import { formatRelativeTime } from "@/lib/formatters"

export default async function SeekerDashboardPage() {
  const [session, stats] = await Promise.all([getSession(), getSeekerStats()])

  const statCards = [
    {
      label: "Saved Jobs",
      value: stats.savedJobs,
      icon: Bookmark,
      href: "/dashboard/seeker/saved-jobs",
      accent: "text-[#8F88FF]",
    },
    {
      label: "Applications Submitted",
      value: stats.applicationsSubmitted,
      icon: FileText,
      href: "/dashboard/seeker/applications",
      accent: "text-[#60A5FA]",
    },
    {
      label: "Interviews Scheduled",
      value: stats.interviewsScheduled,
      icon: CalendarCheck,
      href: "/dashboard/seeker/applications",
      accent: "text-[#F59E0B]",
    },
    {
      label: "Offers Received",
      value: stats.offersReceived,
      icon: Trophy,
      href: "/dashboard/seeker/applications",
      accent: "text-[#22C55E]",
    },
  ]

  return (
    <PageContainer width="wide">
      {/* Top Search Bar matching Figma Seeker Dashboard Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="overline-label">Job Seeker Workspace</p>
          <h1 className="page-title mt-1">
            Welcome back, {session?.user?.name || "Job Seeker"}
          </h1>
        </div>

        <form action="/dashboard/seeker/jobs" className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#828997]" />
          <input
            type="search"
            name="search"
            placeholder="Search for opportunities..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-4 text-sm text-[#EDEDEF] outline-none placeholder:text-[#828997] focus:border-[#5C53FE]"
          />
        </form>
      </div>

      {/* 4-Card Stats Row */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-white/10 bg-[#141418] p-6 transition-colors hover:border-[#5C53FE]/50"
          >
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-[#A0A0AB]">{label}</dt>
              <Icon className={`size-4 ${accent}`} />
            </div>
            <dd className="mt-3 text-[28px] font-semibold leading-8 text-[#EDEDEF]">
              {value}
            </dd>
          </Link>
        ))}
      </dl>

      {/* Bottom Section: Recent Activity */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-[#EDEDEF]">Recent Activity</h2>
          <Link
            href="/dashboard/seeker/applications"
            className="text-xs font-medium text-[#A0A0AB] transition-colors hover:text-white"
          >
            View All Activity
          </Link>
        </div>

        {stats.activities.length > 0 ? (
          <ul className="divide-y divide-white/[0.07]">
            {stats.activities.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1D1D24] text-[#8F88FF]">
                      {item.type === "application" ? (
                        <FileText className="size-4" />
                      ) : (
                        <Bell className="size-4 text-[#22C55E]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#EDEDEF]">{item.title}</p>
                      <p className="mt-0.5 text-xs text-[#A0A0AB]">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-[#6E6E78]" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-[#A0A0AB]">
              No activity yet. Start exploring jobs and applying to roles!
            </p>
            <Link
              href="/dashboard/seeker/jobs"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#0B0B0C] hover:bg-white"
            >
              <Briefcase className="size-4" /> Explore Available Jobs
            </Link>
          </div>
        )}
      </section>
    </PageContainer>
  )
}
