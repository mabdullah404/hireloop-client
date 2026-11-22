// User role pill — Figma "Admin / Manage Users" role palette, via the
// generic Pill primitive.

import { Pill } from "@/components/shared/pill"
import { ROLE_META, type UserRole } from "@/lib/types/users"

export function RolePill({ role }: { role: UserRole }) {
    const { label, color } = ROLE_META[role]
    return <Pill label={label} color={color} dot />
}
