// Generic status/role pill — colored border + text on a 10% tint of the
// same color (the treatment used across the Figma dashboard tables).
// Optionally shows a leading dot. Domain-specific wrappers (StatusPill,
// RolePill) pass their palette metadata into this.

import { cn } from "@/lib/utils"

export function Pill({
    label,
    color,
    dot = false,
    className,
}: {
    label: string
    color: string
    dot?: boolean
    className?: string
}) {
    return (
        <span
            className={cn(
                "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium",
                className,
            )}
            style={{ color, borderColor: color, backgroundColor: `${color}1A` }}
        >
            {dot ? (
                <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
            ) : null}
            {label}
        </span>
    )
}
