/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/users/_components/users-table.tsx
 * ==============================================================================
 * PURPOSE:
 *   High-density Admin User Management table matching Figma `Admin / Manage Users`:
 *     - Search by name or email
 *     - Filter by Role (All Roles / Seeker / Recruiter / Admin)
 *     - Export CSV list
 *     - Per-row Actions:
 *         1. Role dropdown -> `PATCH http://localhost:5000/users/:id/role`
 *         2. Suspend / Activate -> `PATCH http://localhost:5000/users/:id/status`
 *         3. Delete User -> `DELETE http://localhost:5000/users/:id`
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { Download, Search, Trash2 } from "lucide-react"

import { RolePill } from "@/components/shared/role-pill"
import { UserRoleSelect } from "@/components/shared/user-role-select"
import { USER_ROLES, ROLE_META, type UserRole, type UserRow } from "@/lib/types/users"
import { deleteUser, updateUserRole, updateUserStatus } from "@/lib/actions/users"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function UsersTable({ users: initialUsers }: { users: UserRow[] }) {
  const [users, setUsers] = React.useState(initialUsers)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"all" | UserRole>("all")
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [users, search, roleFilter])

  const handleRoleChange = async (userId: string, nextRole: UserRole) => {
    setBusyId(userId)
    try {
      const res = await updateUserRole(userId, nextRole)
      if (res?.success || res?.modifiedCount) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        )
        toast.add({
          title: "Role updated",
          description: `User role changed to ${ROLE_META[nextRole].label}.`,
        })
      } else {
        toast.add({ title: "Error", description: res?.message || "Could not update role." })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleSuspend = async (user: UserRow) => {
    setBusyId(user.id)
    const nextBanned = !user.banned
    try {
      const res = await updateUserStatus(user.id, nextBanned)
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, banned: nextBanned } : u))
        )
        toast.add({
          title: nextBanned ? "Account suspended" : "Account activated",
          description: `${user.email} is now ${nextBanned ? "suspended" : "active"}.`,
        })
      } else {
        toast.add({ title: "Action blocked", description: res?.message || "Could not update status." })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (user: UserRow) => {
    if (!window.confirm(`Permanently delete ${user.email}?`)) return
    setBusyId(user.id)
    try {
      const res = await deleteUser(user.id)
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        toast.add({ title: "User deleted", description: `${user.email} was removed.` })
      } else {
        toast.add({ title: "Action blocked", description: res?.message || "Could not delete user." })
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleExportCsv = () => {
    const rows = [
      ["Name", "Email", "Role", "Status", "Join Date"],
      ...filtered.map((u) => [
        `"${u.name}"`,
        u.email,
        u.role,
        u.banned ? "Suspended" : "Active",
        new Date(u.createdAt).toLocaleDateString("en-US"),
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hireloop-users.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Role Filter + Export List */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#A0A0AB]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#141418] pl-10 pr-3 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
            className="h-10 rounded-lg border border-white/10 bg-[#141418] px-3 text-xs font-medium text-[#EDEDEF] outline-none"
          >
            <option value="all">All Roles</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-xs font-semibold text-[#0B0B0C] hover:bg-white"
          >
            <Download className="size-3.5" />
            Export List
          </button>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#141418]">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
              <th className="px-5 py-3.5">User Name</th>
              <th className="px-5 py-3.5">Email Address</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Join Date</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-medium text-[#EDEDEF]">{user.name}</td>
                <td className="px-5 py-3.5 text-[#A0A0AB]">{user.email}</td>
                <td className="px-5 py-3.5">
                  <RolePill role={user.role} />
                </td>
                <td className="px-5 py-3.5 text-xs text-[#A0A0AB]">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      user.banned
                        ? "bg-red-500/15 text-[#EF4444]"
                        : "bg-[#22C55E]/15 text-[#22C55E]"
                    )}
                  >
                    {user.banned ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <UserRoleSelect
                      value={user.role}
                      disabled={busyId === user.id}
                      onChange={(next) => handleRoleChange(user.id, next)}
                    />
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleToggleSuspend(user)}
                      className={cn(
                        "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                        user.banned
                          ? "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20"
                          : "border-red-500/30 bg-red-500/10 text-[#F74C4C] hover:bg-red-500/20"
                      )}
                    >
                      {user.banned ? "Activate" : "Suspend"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleDelete(user)}
                      aria-label={`Delete ${user.email}`}
                      className="rounded-md p-1.5 text-[#A0A0AB] transition-colors hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#A0A0AB]">
                  No users match your filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
