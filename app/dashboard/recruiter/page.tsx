/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Recruiter Dashboard Overview matching Figma `Recruiter / Dashboard`:
 *     - Welcome header + "+ Create Job Post" button
 *     - 4-card Stats Row: Total Job Posts, Total Applicants, Active Jobs, Jobs Closed
 *     - Recent Applications table with quick link to review all applicants
 *
 * API CALLS MADE HERE:
 *   - `getRecruiterStats()` -> `GET http://localhost:5000/dashboard/recruiter/stats`
 * ==============================================================================
 */

import Link from "next/link"
import { Briefcase, CheckCircle2, PlusCircle, Users, XCircle } from "lucide-react"

import { PageContainer } from "@/components/dashboard/page-shell"
import { StatusPill } from "@/components/shared/status-pill"
import { getSession } from "@/lib/core/server"
import { getRecruiterStats } from "@/lib/api/dashboard"
import { formatDate } from "@/lib/formatters"

export default async function RecruiterDashboardPage() {
  const [session, stats] = await Promise.all([getSession(), getRecruiterStats()])

  const statCards = [
    { label: "Total Job Posts", value: stats.totalJobPosts, icon: Briefcase, color: "text-[#8F88FF]" },
    { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "text-[#60A5FA]" },
    { label: "Active Jobs", value: stats.activeJobs, icon: CheckCircle2, color: "text-[#22C55E]" },
    { label: "Jobs Closed", value: stats.closedJobs, icon: XCircle, color: "text-[#A0A0AB]" },
  ]

  return (
    <PageContainer width="wide">
      {/* Header + Create Job Post CTA */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="overline-label">Recruiter Workspace</p>
          <h1 className="page-title mt-1">
            Welcome back, {session?.user?.name || "Recruiter"}
          </h1>
        </div>

        <Link
          href="/dashboard/recruiter/jobs/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-semibold text-[#0B0B0C] transition-colors hover:bg-white"
        >
          <PlusCircle className="size-4" />
          Create Job Post
        </Link>
      </div>

      {/* 4-Card Stats Row */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#141418] p-6"
          >
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-[#A0A0AB]">{label}</dt>
              <Icon className={`size-4 ${color}`} />
            </div>
            <dd className="mt-3 text-[28px] font-semibold leading-8 text-[#EDEDEF]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Recent Applications Table */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-[#EDEDEF]">Recent Applications</h2>
          <Link
            href="/dashboard/recruiter/applications"
            className="text-xs font-medium text-[#8F88FF] hover:text-white"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
                <th className="py-3">Candidate Name</th>
                <th className="py-3">Role</th>
                <th className="py-3">Date Applied</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {stats.recentApplications.map((app) => (
                <tr key={app._id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5">
                    <p className="font-medium text-[#EDEDEF]">
                      {app.applicantName || app.email}
                    </p>
                    <p className="text-xs text-[#A0A0AB]">{app.email}</p>
                  </td>
                  <td className="py-3.5 text-[#A0A0AB]">{app.jobTitle}</td>
                  <td className="py-3.5 text-[#A0A0AB]">{formatDate(app.appliedAt)}</td>
                  <td className="py-3.5">
                    <StatusPill status={app.status} />
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/dashboard/recruiter/jobs/${app.jobId}/applications`}
                      className="text-xs font-medium text-[#8F88FF] hover:text-white"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#A0A0AB]">
                    No candidate applications received yet. Post a job to start receiving
                    applications!
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
