/**
 * ==============================================================================
 * FILE: client/app/company/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Public Companies Directory (`/company`) linked from the main SiteNavbar.
 *   Displays verified hiring companies, industry, team size, location, and open role counts.
 *
 * API CALLS MADE HERE:
 *   - `getCompanies()` -> `GET http://localhost:5000/companies`
 *   - `getJobs("status=active")` -> fallback company aggregation if needed
 * ==============================================================================
 */

import Link from "next/link"
import { ArrowRight, BadgeCheck, Building2, Globe, MapPin, Users } from "lucide-react"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { getCompanies } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"

export default async function CompaniesDirectoryPage() {
  const [companies, activeJobs] = await Promise.all([
    getCompanies(),
    getJobs("status=active"),
  ])

  // If recruiters posted jobs without filling "My Company", include those companies too
  const knownNames = new Set(companies.map((c) => c.name.trim().toLowerCase()))
  const inferred = new Map<string, { name: string; location: string; openJobs: number }>()
  for (const job of activeJobs) {
    const key = job.companyName.trim().toLowerCase()
    if (knownNames.has(key)) continue
    const prev = inferred.get(key)
    inferred.set(key, {
      name: job.companyName,
      location: job.location,
      openJobs: (prev?.openJobs || 0) + 1,
    })
  }

  const allCompanies = [
    ...companies.map((c) => ({
      id: c._id,
      name: c.name,
      industry: c.industry || "Technology",
      size: c.size || "50 - 250 Employees",
      location: c.location || "Remote",
      website: c.website || "",
      description: c.description || "Hiring world-class talent on HireLoop.",
      verified: c.verified,
      openJobs: c.openJobs ?? 0,
    })),
    ...Array.from(inferred.values()).map((c) => ({
      id: `inferred-${c.name}`,
      name: c.name,
      industry: "Technology",
      size: "Growing Team",
      location: c.location,
      website: "",
      description: "Actively hiring on HireLoop.",
      verified: false,
      openJobs: c.openJobs,
    })),
  ]

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF]">
      <SiteNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="overline-label">Verified Employers</p>
            <h1 className="page-title mt-2">Top Companies Hiring</h1>
            <p className="mt-2 text-sm text-[#A0A0AB]">
              Explore vetted teams, open roles, and company profiles across HireLoop.
            </p>
          </div>
          <Link
            href="/browse-jobs"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#5C53FE] px-4 text-sm font-medium text-white hover:bg-[#7B74FF]"
          >
            Browse All Open Roles <ArrowRight className="size-4" />
          </Link>
        </div>

        {allCompanies.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCompanies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141418] p-6 transition-colors hover:border-[#5C53FE]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#5C53FE]/15 text-lg font-bold text-[#8F88FF]">
                      {company.name.slice(0, 1).toUpperCase()}
                    </div>
                    {company.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-xs font-medium text-[#22C55E]">
                        <BadgeCheck className="size-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-white">{company.name}</h2>
                  <p className="mt-1 text-xs font-medium text-[#8F88FF]">{company.industry}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-[#A0A0AB]">{company.description}</p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#A0A0AB]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {company.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {company.size}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <Link
                    href={`/browse-jobs?search=${encodeURIComponent(company.name)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#8F88FF]"
                  >
                    <Building2 className="size-4 text-[#8F88FF]" />
                    {company.openJobs} Open {company.openJobs === 1 ? "Role" : "Roles"}
                  </Link>

                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#A0A0AB] hover:text-white"
                    >
                      <Globe className="size-3.5" /> Website
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-white/15 bg-[#141418] p-12 text-center text-sm text-[#A0A0AB]">
            No companies registered yet. Recruiters can configure their profile in{" "}
            <Link href="/dashboard/recruiter/my-company" className="text-[#8F88FF] underline">
              My Company
            </Link>
            .
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
