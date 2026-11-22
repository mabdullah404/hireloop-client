// Applications review — recruiter page for one job's applicants, at
// dashboard/recruiter/jobs/[id]/applications. Reached via the "View
// applications" link on each row of the Manage Jobs table.
//
// Data comes from GET /applications?jobId=… (applications API). Status
// changes in the table are client-side for now — the recruiter-side DB
// update is wired up later.

import { notFound } from "next/navigation"
import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getJobs } from "@/lib/api/jobs"
import { getApplications } from "@/lib/api/applications"
import type { ApplicationRow } from "@/lib/types/applications"
import { ApplicationsReviewTable } from "./_components/applications-review-table"

export default async function JobApplicationsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // No GET /jobs/:id yet — resolve the job out of the list.
    const job = (await getJobs()).find((job) => job._id === id)
    if (!job) notFound()

    // Transport hiccups degrade to the empty state instead of a 500.
    let applications: ApplicationRow[] = []
    try {
        applications = await getApplications(`jobId=${id}`)
    } catch (error) {
        console.error("Failed to load applications:", error)
    }

    return (
        <PageContainer width="wide">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm">
                <span className="text-white/50">Manage Jobs</span>
                <span aria-hidden className="text-white/30">/</span>
                <span className="max-w-64 truncate text-white/90">{job.title}</span>
                <span aria-hidden className="text-white/30">/</span>
                <span className="text-white/50">Applications</span>
            </nav>

            <PageHeader
                title="Job Applications"
                subtitle={`Review applicants for ${job.title} at ${job.companyName} and update their hiring status.`}
            />

            {applications.length > 0 ? (
                <section className="surface-card overflow-hidden">
                    <ApplicationsReviewTable applications={applications} />
                </section>
            ) : (
                <section className="surface-card p-10 text-center text-sm text-white/50">
                    No applications yet for this job.
                </section>
            )}
        </PageContainer>
    )
}
