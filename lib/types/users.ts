// Shared user domain types — single source of truth for the admin User
// Management page (`dashboard/admin/users`) and any future user-facing
// admin surfaces.
//
// Roles match the better-auth `role` additionalField configured in
// `lib/auth.ts` (["seeker", "recruiter", "admin"]).

export type UserRole = "seeker" | "recruiter" | "admin"

/** Role pill labels + Figma "Admin / Manage Users" palette. */
export const ROLE_META: Record<UserRole, { label: string; color: string }> = {
    seeker: { label: "Seeker", color: "#A1A4AA" },
    recruiter: { label: "Recruiter", color: "#8F88FF" },
    admin: { label: "Admin", color: "#F59E0B" },
}

/** All roles, in privilege order. */
export const USER_ROLES = Object.keys(ROLE_META) as UserRole[]

// One row of the User Management table (subset of the better-auth user).
export type UserRow = {
    id: string
    _id?: string
    name: string
    email: string
    role: UserRole
    /** Account creation timestamp (ISO string) — rendered as "Oct 12, 2023". */
    createdAt: string
    /** Better-auth admin plugin flag; drives the Suspended status pill. */
    banned?: boolean
}
