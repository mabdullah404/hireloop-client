"use client"

// Native select for changing a user's role. Rendering only — persistence
// is the caller's responsibility (the admin users page wires the DB
// update separately). Same pattern as ApplicationStatusSelect.

import { cn } from "@/lib/utils"
import { ROLE_META, USER_ROLES, type UserRole } from "@/lib/types/users"

export function UserRoleSelect({
    value,
    onChange,
    disabled,
    className,
}: {
    value: UserRole
    onChange: (role: UserRole) => void
    disabled?: boolean
    className?: string
}) {
    return (
        <select
            aria-label="Change user role"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value as UserRole)}
            className={cn(
                "surface-field h-8 rounded-md px-2.5 text-xs text-[#EDEDEF]",
                className,
            )}
        >
            {USER_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#1A1A1F]">
                    Make {ROLE_META[role].label}
                </option>
            ))}
        </select>
    )
}
