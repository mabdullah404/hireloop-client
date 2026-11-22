// Application status pill — colored border + text on a 10% tint of the
// same color (Figma "Seeker / My Applications" status palette).
// Shared by the seeker My Applications table and the recruiter
// applications review table.

import { STATUS_META, type ApplicationStatus } from "@/lib/types/applications"

export function StatusPill({ status }: { status: ApplicationStatus }) {
    const { label, color } = STATUS_META[status]
    return (
        <span
            className="inline-flex h-[22px] items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-medium"
            style={{ color, borderColor: color, backgroundColor: `${color}1A` }}
        >
            {label}
        </span>
    )
}
