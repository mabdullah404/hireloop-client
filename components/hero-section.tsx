/**
 * ==============================================================================
 * FILE: client/components/hero-section.tsx
 * ==============================================================================
 * PURPOSE:
 *   Figma `Design / Homepage` Hero Section:
 *     - "50,000+ new jobs this month" glowing pill
 *     - "Find Your Dream Job Today" display heading
 *     - Dual search bar (Job title/skill/company + Location/Remote) -> navigates to `/browse-jobs`
 *     - Trending Position quick-search chips
 *     - Glowing purple horizon + Earth globe backdrop (`app/images/globe.png`)
 *
 * USED BY:
 *   - `client/app/page.tsx`
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Search, Sparkles } from "lucide-react"

import globe from "@/app/images/globe.png"

const TRENDING = [
  "Product Designer",
  "AI Engineering",
  "Dev-ops Engineer",
] as const

const inputFieldClass =
  "flex h-11 flex-1 items-center gap-2 text-base leading-[1.7]"

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [location, setLocation] = React.useState("")

  // Submit handler: redirects to `/browse-jobs?search=...&location=...`
  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())
    if (location.trim()) params.set("location", location.trim())

    router.push(`/browse-jobs${params.size ? `?${params.toString()}` : ""}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#010103] text-white">
      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6">
        {/* Top Glowing Badge */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div
            aria-hidden
            className="hidden h-px w-16 bg-gradient-to-r from-[#010123] to-[#A8A8A8] opacity-70 sm:block"
          />
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-b from-[#474747] to-[#010102] px-6 py-2.5 shadow-[inset_0_0_6px_6px_rgba(255,255,255,0.1)]">
            <Sparkles aria-hidden className="size-5 text-[#8F88FF]" />
            <span className="font-badge text-base leading-[1.2] sm:text-lg">
              50,000+ new jobs this month
            </span>
          </div>
          <div
            aria-hidden
            className="hidden h-px w-16 bg-gradient-to-l from-[#010123] to-[#A8A8A8] opacity-70 sm:block"
          />
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-heading text-[40px] leading-[1.15] font-bold tracking-[-0.02em] md:text-[56px]">
            Find Your Dream Job Today
          </h1>
          <p className="max-w-2xl text-lg leading-[1.6] text-white/80 md:text-xl">
            HireLoop connects top talent with world-class companies. Browse
            thousands of curated opportunities and land your next role — faster.
          </p>
        </div>

        {/* Search Bar -> routes directly to /browse-jobs */}
        <form
          onSubmit={onSubmit}
          role="search"
          className="mt-8 rounded-2xl border border-white/20 bg-[#101010] p-2 md:p-3"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 md:px-3">
            <div className={inputFieldClass}>
              <Search aria-hidden className="size-5 shrink-0 text-white/60" />
              <input
                name="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, skill or company"
                className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/60"
              />
            </div>

            <div aria-hidden className="hidden h-6 w-px bg-white/20 md:block" />

            <div className={inputFieldClass}>
              <MapPin aria-hidden className="size-5 shrink-0 text-white/60" />
              <input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location or Remote"
                className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/60"
              />
            </div>

            <button
              type="submit"
              aria-label="Search jobs"
              className="mt-1 flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5C53FE] px-5 font-medium transition-colors hover:bg-[#7B74FF] md:mt-0 md:w-12 md:px-0"
            >
              <Search aria-hidden className="size-5" />
              <span className="md:hidden">Search Jobs</span>
            </button>
          </div>
        </form>

        {/* Trending Position Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-white/75">Trending Position</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRENDING.map((label) => (
              <Link
                key={label}
                href={`/browse-jobs?search=${encodeURIComponent(label)}`}
                className="rounded-full border border-white/10 bg-[#1A1A1B] px-3.5 py-1.5 text-sm leading-[1.5] transition-colors hover:border-[#5C53FE]/50 hover:bg-[#5C53FE]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Glowing Purple Horizon + Earth Globe */}
      <div className="relative z-0 h-[360px] sm:h-[480px] lg:h-[620px]">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[min(900px,180vw)] w-[min(1200px,86vw)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5C53FE] blur-[148px]"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[min(900px,178vw)] w-[min(1160px,84vw)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#010103]"
        />
        <div className="absolute inset-y-0 left-1/2 w-full max-w-[1180px] -translate-x-1/2">
          <Image
            src={globe}
            alt=""
            aria-hidden
            priority
            placeholder="blur"
            sizes="(min-width: 1248px) 1180px, 100vw"
            className="object-cover object-bottom select-none"
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-screen [background:radial-gradient(75%_60%_at_50%_32%,rgba(92,83,254,0.50)_0%,rgba(92,83,254,0.22)_42%,transparent_72%)]"
          />
        </div>
      </div>
    </section>
  )
}
