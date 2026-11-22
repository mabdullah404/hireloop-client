/**
 * ==============================================================================
 * FILE: client/app/browse-jobs/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Browse Jobs page matching Figma `Public / Browse Jobs`:
 *     - Top Search & Quick Filters bar (`JobSearchBar`)
 *     - Left Sidebar Filters (`JobFiltersPanel`)
 *     - Live job count heading ("Found X Professional Jobs") + Sort links
 *     - Job list cards (`JobCard`) with live bookmark state from MongoDB
 *
 * API CALLS MADE HERE:
 *   - `getJobs(query)` -> `GET http://localhost:5000/jobs?<query>`
 *   - `getSavedJobs()` -> `GET http://localhost:5000/saved-jobs` (only if logged in)
 * ==============================================================================
 */

import Link from "next/link"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { getJobs } from "@/lib/api/jobs"
import { getSavedJobs } from "@/lib/api/saved-jobs"

import { JobSearchBar } from "./_components/job-search-bar"
import { JobFiltersPanel } from "./_components/job-filters-panel"
import JobCard from "../components/JobCard"

export default async function BrowseJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const search = await searchParams
  const urlSearch = new URLSearchParams()

  // Copy all active URL query params safely into URLSearchParams
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string" && value.trim()) {
      urlSearch.set(key, value)
    }
  }
  // Only show active jobs publicly unless explicitly filtered
  if (!urlSearch.has("status")) {
    urlSearch.set("status", "active")
  }

  const currentSort = urlSearch.get("sort") || "recent"

  // Fetch jobs and (if logged in) saved job IDs in parallel
  const [jobs, savedList] = await Promise.all([
    getJobs(urlSearch.toString()),
    getSavedJobs(),
  ])
  const savedIds = new Set(savedList.map((s) => s.jobId))

  const buildSortHref = (sortValue: string) => {
    const next = new URLSearchParams(urlSearch.toString())
    next.set("sort", sortValue)
    return `/browse-jobs?${next.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF]">
      <SiteNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Search & Quick Filters */}
        <JobSearchBar />

        {/* Sidebar Filters + Main Job Listing */}
        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-8">
          <aside>
            <JobFiltersPanel jobs={jobs} />
          </aside>

          <section>
            {/* Results count + Sort links */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#EDEDEF]">
                Found {jobs.length} Professional {jobs.length === 1 ? "Job" : "Jobs"}
              </h1>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6E6E78]">Sort by:</span>
                {[
                  { id: "recent", label: "Most Recent" },
                  { id: "salary_desc", label: "Highest Salary" },
                  { id: "salary_asc", label: "Lowest Salary" },
                ].map((opt) => (
                  <Link
                    key={opt.id}
                    href={buildSortHref(opt.id)}
                    className={
                      currentSort === opt.id
                        ? "rounded-md bg-[#222228] px-2.5 py-1 font-medium text-white"
                        : "rounded-md px-2.5 py-1 text-[#A0A0AB] hover:text-white"
                    }
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Job Cards List */}
            <ul className="mt-4 flex list-none flex-col gap-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} initialSaved={savedIds.has(job._id)} />
              ))}
              {jobs.length === 0 ? (
                <li className="surface-card p-10 text-center text-sm text-[#A0A0AB]">
                  No jobs match your current search or filter criteria.
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
