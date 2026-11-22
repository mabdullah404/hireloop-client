/**
 * ==============================================================================
 * FILE: client/app/components/DashboardSidebar.tsx
 * ==============================================================================
 * PURPOSE:
 *   Role-aware Dashboard Sidebar built from Figma's `HL 2.0/Sidebar` component
 *   (with all 3 role variants: `Seeker`, `Recruiter`, and `Admin`):
 *     - Seeker:    Dashboard, Jobs, Saved Jobs, Applications, Billing, Settings
 *     - Recruiter: Dashboard, My Company, Manage Jobs, Add Job, Applications, Settings
 *     - Admin:     Dashboard, Users, Companies, Jobs, Payments, Settings
 *   Highlights the currently active route with `#232327` and includes a Sign Out button!
 *
 * USED BY:
 *   - `client/app/dashboard/layout.tsx`
 * ==============================================================================
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Bookmark,
  Briefcase,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession, signOut } from "@/lib/auth-client"
import { ROLE_META } from "@/lib/types/users"
import type { UserRole } from "@/lib/types/user"
import { UserAvatar } from "@/components/shared/user-avatar"
import { cn } from "@/lib/utils"

type MenuItem = {
  id: string
  name: string
  url: string
  icon: LucideIcon
  exact?: boolean
}

const homeItem: MenuItem = { id: "home", name: "Back to Home", url: "/", icon: Home }

const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  seeker: [
    { id: "dashboard", name: "Dashboard", url: "/dashboard/seeker", icon: LayoutDashboard, exact: true },
    { id: "jobs", name: "Jobs", url: "/dashboard/seeker/jobs", icon: Briefcase },
    { id: "saved-jobs", name: "Saved Jobs", url: "/dashboard/seeker/saved-jobs", icon: Bookmark },
    { id: "applications", name: "Applications", url: "/dashboard/seeker/applications", icon: FileText },
    { id: "billing", name: "Billing", url: "/dashboard/seeker/billing", icon: Wallet },
    { id: "settings", name: "Settings", url: "/dashboard/seeker/settings", icon: Settings },
  ],
  recruiter: [
    { id: "dashboard", name: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard, exact: true },
    { id: "my-company", name: "My Company", url: "/dashboard/recruiter/my-company", icon: Building2 },
    { id: "manage-jobs", name: "Manage Jobs", url: "/dashboard/recruiter/jobs", icon: Briefcase, exact: true },
    { id: "add-job", name: "Add Job", url: "/dashboard/recruiter/jobs/new", icon: PlusCircle },
    { id: "applications", name: "Applications", url: "/dashboard/recruiter/applications", icon: FileText },
    { id: "settings", name: "Settings", url: "/dashboard/recruiter/settings", icon: Settings },
  ],
  admin: [
    { id: "dashboard", name: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, exact: true },
    { id: "users", name: "Users", url: "/dashboard/admin/users", icon: Users },
    { id: "companies", name: "Companies", url: "/dashboard/admin/companies", icon: Building2 },
    { id: "jobs", name: "Jobs", url: "/dashboard/admin/jobs", icon: Briefcase },
    { id: "payments", name: "Payments", url: "/dashboard/admin/payments", icon: Wallet },
    { id: "settings", name: "Settings", url: "/dashboard/admin/settings", icon: Settings },
  ],
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Infer role from URL prefix first (so visiting /dashboard/seeker shows Seeker, /dashboard/recruiter shows Recruiter, etc.)
  const inferredFromPath: UserRole | null = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/recruiter")
    ? "recruiter"
    : pathname.startsWith("/dashboard/seeker")
    ? "seeker"
    : null

  const role: UserRole = inferredFromPath || (session?.user?.role as UserRole) || "seeker"

  const handleSignOut = async () => {
    const wasAdmin = role === "admin"
    await signOut()
    router.refresh()
    router.push(wasAdmin ? "/admin" : "/sign-in")
  }

  return (
    <Sidebar className="border-r border-white/10 bg-[#0B0B0C]">
      <SidebarHeader className="border-b border-white/10 px-3 py-4">
        <Link href="/" className="mb-3 flex items-center px-2">
          <Image
            src="/logo.png"
            alt="HireLoop"
            width={126}
            height={34}
            className="h-8 w-auto"
          />
        </Link>

        {/* Signed-in user profile card matching Figma Aside */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#151518] px-3 py-2.5">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            className="size-9"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-[#EDEDEF]">
              {isPending ? "Loading..." : session?.user?.name || "Member"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs text-[#A0A0AB]">
                {ROLE_META[role]?.label || role}
              </span>
              {session?.user?.premium ? (
                <span className="rounded bg-[#5C53FE]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#C3C0FF]">
                  Pro
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {/* Shared Home Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href={homeItem.url} />}
                className="text-[#A1A4AA] hover:bg-[#1B1B1E] hover:text-white"
              >
                <homeItem.icon className="size-4" />
                <span>{homeItem.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Role-Specific Navigation */}
        <SidebarGroup>
          <p className="mb-1.5 px-3 text-[11px] font-medium tracking-wider text-[#6E6E78] uppercase">
            {ROLE_META[role]?.label} Menu
          </p>
          <SidebarMenu>
            {menuItemsByRole[role].map((item) => {
              const isActive = item.exact
                ? pathname === item.url
                : pathname === item.url || pathname.startsWith(item.url + "/")

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    className={cn(
                      "rounded-lg transition-colors",
                      isActive
                        ? "bg-[#232327] font-medium text-[#F4F4F5]"
                        : "text-[#A1A4AA] hover:bg-[#1B1B1E] hover:text-[#F4F4F5]"
                    )}
                  >
                    <item.icon className={cn("size-4", isActive && "text-[#8F88FF]")} />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-3">
        {role === "seeker" && (
          <Link
            href="/dashboard/seeker/profile"
            className="mb-2 flex h-10 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            Post Resume
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-[#A1A4AA] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
