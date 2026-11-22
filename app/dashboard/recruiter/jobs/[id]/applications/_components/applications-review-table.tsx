"use client"

// Recruiter view of a job's applicants — one row per application with the
// current status pill and a select to move the applicant along the
// pipeline. Status changes are local for now: persisting them to the
// database is wired up separately (see handleStatusChange).

import { useState } from "react"
import { StatusPill } from "@/components/shared/status-pill"
import { ApplicationStatusSelect } from "@/components/shared/application-status-select"
import { formatRelativeTime } from "@/lib/formatters"
import { updateApplicationStatus } from "@/lib/actions/applications"
import type { ApplicationRow, ApplicationStatus } from "@/lib/types/applications"

const headerCellClass = "px-3 py-3 text-[12px] font-medium text-[#6E6E78]"

export function ApplicationsReviewTable({
    applications,
}: {
    applications: readonly ApplicationRow[]
}) {
    // Current status per application (row id → status), editable below.
    const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() =>
        Object.fromEntries(applications.map((app) => [app._id, app.status])),
    )

    const handleStatusChange = async (id: string, status: ApplicationStatus) => {
        const result = await updateApplicationStatus(id, { status });

        console.log('update result', result);

        if (result.modifiedCount > 0) {
            setStatuses((prev) => ({ ...prev, [id]: status }))
        }

    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-3xl text-left">
                <colgroup>
                    <col className="w-[34%]" />
                    <col className="w-[18%]" />
                    <col className="w-[16%]" />
                    <col />
                </colgroup>

                <thead>
                    <tr className="border-b border-white/10">
                        <th scope="col" className={headerCellClass}>Applicant</th>
                        <th scope="col" className={headerCellClass}>Applied</th>
                        <th scope="col" className={headerCellClass}>Status</th>
                        <th scope="col" className={headerCellClass}>Update status</th>
                    </tr>
                </thead>

                <tbody>
                    {applications.map((app) => (
                        <tr
                            key={app._id}
                            className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                        >
                            <td className="px-3 py-3.5">
                                <span className="block truncate text-[13px] font-medium text-[#EDEDEF]">
                                    {app.email}
                                </span>
                            </td>

                            <td className="px-3 py-3.5 text-[13px] text-[#A0A0AB]">
                                {formatRelativeTime(app.appliedAt)}
                            </td>

                            <td className="px-3 py-3.5">
                                <StatusPill status={statuses[app._id] ?? app.status} />
                            </td>

                            <td className="px-3 py-3.5">
                                <ApplicationStatusSelect
                                    value={statuses[app._id] ?? app.status}
                                    onChange={(status) => handleStatusChange(app._id, status)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
