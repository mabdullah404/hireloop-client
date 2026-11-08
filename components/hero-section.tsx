"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) params.append("q", keyword)
    if (location) params.append("location", location)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32 bg-[#030308] text-white">
      {/* Background Top Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#5C53FE]/20 blur-[130px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* --- ১. টপ ব্যাজ (Side lines সহ) --- */}
        <div className="flex items-center justify-center gap-3">
          <div className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent to-white/20" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs tracking-wider text-gray-300 backdrop-blur-md">
            <Briefcase className="size-3.5 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              50,000+ NEW JOBS THIS MONTH
            </span>
          </div>
          <div className="hidden sm:block w-16 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* --- ২. মূল হেডলাইন --- */}
        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
          Find Your Dream Job Today
        </h1>

        {/* --- ৩. সাব-হেডলাইন --- */}
        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
          HireLoop connects top talent with world-class companies. Browse thousands of
          curated opportunities and land your next role — faster.
        </p>

        {/* --- ৪. সার্চ বার (Dark Container + Purple Search Icon Button) --- */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-[#0d0d15]/90 shadow-2xl shadow-black/80 backdrop-blur-md"
        >
          {/* ইনপুট ১: Job title */}
          <div className="flex flex-1 items-center gap-3 px-3 py-2 w-full">
            <Search className="size-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job tilte, skill or company"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500 font-normal"
            />
          </div>

          {/* ডিভাইডার */}
          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* ইনপুট ২: Location */}
          <div className="flex flex-1 items-center gap-3 px-3 py-2 w-full">
            <MapPin className="size-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Remote"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500 font-normal"
            />
          </div>

          {/* সার্চ বাটন (Icon Only) */}
          <Button
            type="submit"
            className="w-full sm:w-11 h-11 bg-[#5C53FE] hover:bg-[#4D44EE] text-white rounded-xl flex items-center justify-center p-0 shrink-0 shadow-lg shadow-[#5C53FE]/30 transition-all"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
        </form>

        {/* --- ৫. ট্রেন্ডিং পজিশন ট্যাগস --- */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-gray-400 font-normal">Trending Position:</span>
          <Link
            href="/jobs?q=Product+Designer"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
          >
            Product Designer
          </Link>
          <Link
            href="/jobs?q=AI+Engineering"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
          >
            AI Engineering
          </Link>
          <Link
            href="/jobs?q=Dev-ops+Engineer"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
          >
            Dev-ops Engineer
          </Link>
        </div>

        {/* --- ৬. গ্লোব সেকশন (Glowing Atmosphere + Globe + Text Over Globe) --- */}
        <div className="relative mt-16 sm:mt-20">
          {/* গ্লোবের পেছনের তীব্র নীল-বেগুনি আলো (Atmospheric Glow) */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[350px] bg-[#3B28CC]/40 blur-[110px] rounded-full" />

          {/* গ্লোব ইমেজ */}
          <div className="relative mx-auto max-w-4xl flex justify-center">
            <Image
              src="/images/globe.png"
              alt="Global Opportunities"
              width={1000}
              height={550}
              priority
              className="w-full max-w-3xl h-auto object-contain opacity-95"
            />

            {/* গ্লোবের উপরের লেখা (Assisting over 15,000 job seekers...) */}
            <div className="absolute top-[48%] sm:top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white tracking-tight leading-snug">
                Assisting over <span className="text-white font-semibold">15,000 job seekers</span>
                <br />
                find their dream positions.
              </h2>
            </div>
          </div>

          {/* --- ৭. ৪টি আলাদা ডার্ক কার্ড (4 Separate Cards) --- */}
          <div className="relative -mt-12 sm:-mt-20 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-0">
            {/* Card 1: 50K */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-md shadow-2xl text-left h-44 hover:border-white/20 transition-all">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Briefcase className="size-4 text-gray-300" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  50K
                </span>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Active Jobs
                </p>
              </div>
            </div>

            {/* Card 2: 12K */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-md shadow-2xl text-left h-44 hover:border-white/20 transition-all">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Building2 className="size-4 text-gray-300" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  12K
                </span>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Companies
                </p>
              </div>
            </div>

            {/* Card 3: 2M */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-md shadow-2xl text-left h-44 hover:border-white/20 transition-all">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Users className="size-4 text-gray-300" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  2M
                </span>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Job Seekers
                </p>
              </div>
            </div>

            {/* Card 4: 97% */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-md shadow-2xl text-left h-44 hover:border-white/20 transition-all">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Star className="size-4 text-gray-300" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  97%
                </span>
                <p className="mt-1 text-xs text-gray-400 font-medium">
                  Satisfication Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
