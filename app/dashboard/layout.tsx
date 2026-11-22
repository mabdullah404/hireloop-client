/**
 * ==============================================================================
 * FILE: client/app/dashboard/layout.tsx
 * ==============================================================================
 * PURPOSE:
 *   Shared Workspace Layout wrapping `/dashboard/seeker/*`, `/dashboard/recruiter/*`,
 *   and `/dashboard/admin/*`. Renders the Figma dark `#0E0E11` main canvas next
 *   to the collapsible `DashboardSidebar`.
 * ==============================================================================
 */

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "../components/DashboardSidebar"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="min-h-screen min-w-0 flex-1 bg-[#0E0E11] text-[#EDEDEF]">
        <div className="flex h-12 items-center border-b border-white/[0.06] px-4 lg:hidden">
          <SidebarTrigger />
          <span className="ml-3 text-sm font-semibold text-white">HireLoop Workspace</span>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout
