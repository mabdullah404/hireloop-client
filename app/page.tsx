/**
 * ==============================================================================
 * FILE: client/app/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Homepage / Landing Page — built directly from Figma's `Design / Homepage`:
 *     1. Floating SiteNavbar
 *     2. HeroSection (50,000+ jobs badge, Search bar, Trending chips, Purple Globe)
 *     3. Trust & Impact Stats Banner ("Assisting over 15,000 job seekers...", 50K / 12K / 2M / 97%)
 *     4. Smart Job Discovery / Featured Jobs Grid (live jobs fetched from Express `GET /jobs`)
 *     5. Features Bento Grid ("Everything you need to succeed" — all 8 Figma cards)
 *     6. Pricing Section (Monthly/Yearly toggle + Starter / Growth / Premium)
 *     7. Bottom CTA Banner ("Your next role is already looking for you" with `cta-bg.png`)
 *     8. SiteFooter
 *
 * API CALLS MADE HERE:
 *   - `getJobs("status=active&limit=6")` -> `GET http://localhost:5000/jobs?status=active&limit=6`
 * ==============================================================================
 */

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Cpu,
  DollarSign,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"

import { SiteNavbar } from "@/components/site-navbar"
import { HeroSection } from "@/components/hero-section"
import { PricingSection } from "@/components/pricing-section"
import { SiteFooter } from "@/components/site-footer"
import { getJobs } from "@/lib/api/jobs"
import { formatSalary } from "@/lib/formatters"
import ctaBg from "@/app/images/cta-bg.png"

// 4 Figma Impact Stats
const IMPACT_STATS = [
  { value: "50K", label: "Active Jobs" },
  { value: "12K", label: "Companies" },
  { value: "2M", label: "Job Seekers" },
  { value: "97%", label: "Satisfaction Rate" },
]

// All 8 Feature Cards from Figma's "Everything you need to succeed" section
const FEATURES = [
  {
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
    icon: Search,
  },
  {
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
    icon: DollarSign,
  },
  {
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
    icon: Building2,
  },
  {
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
    icon: Bookmark,
  },
  {
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
    icon: Zap,
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
    icon: FileText,
  },
  {
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: Cpu,
  },
  {
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
    icon: GraduationCap,
  },
]

export default async function HomePage() {
  // Fetch the latest 6 active jobs from Express (`GET /jobs?status=active&limit=6`)
  const featuredJobs = await getJobs("status=active&limit=6")

  return (
    <div className="min-h-screen bg-[#010103] text-white">
      <SiteNavbar />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Impact Stats Section */}
      <section className="border-y border-white/10 bg-[#050508] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading mx-auto max-w-3xl text-center text-2xl font-medium leading-snug text-white sm:text-4xl">
            Assisting over 15,000 job seekers find their dream positions.
          </h2>

          <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {IMPACT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-[#0D0D12] p-6 text-center"
              >
                <dd className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm text-[#A1A4AA] sm:text-base">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. Smart Job Discovery / Featured Jobs */}
      <section className="bg-[#010103] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5">
                <Sparkles className="size-4 text-[#8F88FF]" />
                <span className="font-badge text-xs tracking-wide text-white/90 sm:text-sm">
                  Smart job discovery
                </span>
              </div>
              <h2 className="font-heading max-w-xl text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
                The roles you&apos;d never find by searching
              </h2>
            </div>

            <Link
              href="/browse-jobs"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#0B0B14] transition-colors hover:bg-white/90"
            >
              View all job open
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Live Featured Jobs Grid */}
          {featuredJobs.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/browse-jobs/${job._id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101014] p-6 transition-all hover:border-[#5C53FE]/60 hover:bg-[#14141B]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-[#5C53FE]/15 text-base font-bold text-[#8F88FF]">
                        {job.companyName.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium capitalize text-[#A1A4AA]">
                        {job.jobType}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-white transition-colors group-hover:text-[#8F88FF]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#A1A4AA]">{job.companyName}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#A1A4AA]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {job.isRemote ? "Remote" : job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5" />
                        {job.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm font-semibold text-white">
                      {formatSalary(job.minSalary, job.maxSalary, job.salaryFrequency)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8F88FF]">
                      View Role <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-white/15 bg-[#101014] p-12 text-center">
              <p className="text-base text-[#A1A4AA]">
                No active jobs posted yet. Sign in as a Recruiter or Admin to publish roles
                or click &ldquo;Seed Demo Data&rdquo; inside Admin Settings!
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-[#5C53FE] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7B74FF]"
                >
                  Post a Job as Recruiter
                </Link>
                <Link
                  href="/browse-jobs"
                  className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Features Bento Grid ("Everything you need to succeed") */}
      <section className="border-t border-white/10 bg-[#050508] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5">
              <Sparkles className="size-4 text-[#8F88FF]" />
              <span className="font-badge text-xs tracking-wide text-white/90 sm:text-sm">
                features job
              </span>
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
              Everything you need to succeed
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-[#101014] p-6 transition-colors hover:border-[#5C53FE]/50"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#5C53FE]/15 text-[#8F88FF]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A1A4AA]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <PricingSection />

      {/* 6. Bottom CTA Banner ("Your next role is already looking for you") */}
      <section className="bg-[#010103] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#101018] px-6 py-20 text-center sm:px-12">
            <Image
              src={ctaBg}
              alt=""
              aria-hidden
              fill
              className="object-cover opacity-45"
            />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-5xl">
                Your next role is
                <br />
                already looking for you
              </h2>
              <p className="mt-4 text-base text-white/80 sm:text-lg">
                Build a profile in three minutes. The matches start arriving tomorrow
                morning.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center rounded-xl bg-white px-7 text-sm font-semibold text-[#0B0B14] transition-colors hover:bg-white/90"
                >
                  Create a free account
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-black/40 px-7 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <SiteFooter />
    </div>
  )
}
