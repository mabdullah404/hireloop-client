"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutGrid,
  Briefcase,
  Bookmark,
  FileText,
  CreditCard,
  Settings,
  Building2,
  PlusCircle,
  Users,
  Receipt,
  LogOut,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"

// ১. Seeker পোর্টালে মেনু আইটেমসমূহ (স্ক্রিনশট অনুযায়ী হুবহু নাম ও আইকন)
const seekerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/seeker",
    icon: LayoutGrid,
  },
  {
    title: "Jobs",
    url: "/dashboard/seeker/jobs",
    icon: Briefcase,
  },
  {
    title: "Saved Jobs",
    url: "/dashboard/seeker/saved",
    icon: Bookmark,
  },
  {
    title: "Applications",
    url: "/dashboard/seeker/applications",
    icon: FileText,
  },
  {
    title: "Billing",
    url: "/dashboard/seeker/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/dashboard/seeker/settings",
    icon: Settings,
  },
]

// ২. Recruiter পোর্টালে মেনু আইটেমসমূহ (স্ক্রিনশটের সাথে হুবহু মিলিয়ে)
const recruiterNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/recruiter",
    icon: LayoutGrid,
  },
  {
    title: "Add Job",
    url: "/dashboard/recruiter/jobs/new",
    icon: PlusCircle,
  },
  {
    title: "Manage Jobs",
    url: "/dashboard/recruiter/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    url: "/dashboard/recruiter/applications",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/dashboard/recruiter/settings",
    icon: Settings,
  },
]

// ৩. Admin পোর্টালে মেনু আইটেমসমূহ
const adminNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LayoutGrid,
  },
  {
    title: "Manage Users",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Manage Companies",
    url: "/dashboard/admin/companies",
    icon: Building2,
  },
  {
    title: "Manage Jobs",
    url: "/dashboard/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Payments",
    url: "/dashboard/admin/payments",
    icon: Receipt,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  // ১. বর্তমান URL পাথ অনুসারে পোর্টাল নির্ধারণ করা (যাতে সিকোয়েন্স অনুযায়ী Seeker পেজে Seeker Portal-ই আসে)
  const currentPortal = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/recruiter")
    ? "recruiter"
    : pathname.startsWith("/dashboard/seeker")
    ? "seeker"
    : (session?.user as { role?: string })?.role || "seeker"

  // পোর্টাল অনুযায়ী মেনু আইটেমস সিলেক্ট করা
  const navItems =
    currentPortal === "admin"
      ? adminNavItems
      : currentPortal === "recruiter"
      ? recruiterNavItems
      : seekerNavItems

  const portalTitle =
    currentPortal === "admin"
      ? "Admin Portal"
      : currentPortal === "recruiter"
      ? "Recruiter Portal"
      : "Seeker Portal"

  // সাইন-আউট হ্যান্ডলার
  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <Sidebar className="w-64 border-r border-white/5 bg-[#08080C] text-white flex flex-col justify-between">
      <div>
        {/* --- ১. হেডার: লোগো --- */}
        <SidebarHeader className="p-6 pb-4">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="HireLoop"
              width={120}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* ইউজার প্রোফাইল কার্ড (Figma স্ক্রিনশট অনুযায়ী) */}
          <div className="mt-4 flex items-center gap-3 p-2.5 rounded-xl bg-[#141318] border border-white/[0.06]">
            <div className="size-9 rounded-full bg-[#5C53FE]/20 border border-[#5C53FE]/30 flex items-center justify-center text-[#5C53FE] shrink-0 font-semibold text-xs overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={36}
                  height={36}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-4 text-gray-300" />
              )}
            </div>
            <div className="min-w-0">
              {currentPortal === "recruiter" ? (
                <>
                  <h4 className="text-xs font-semibold text-white truncate">
                    {session?.user?.name || "Alex Sterling"}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-normal">
                    Recruiter
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-medium text-[#A594FD] bg-[#5C53FE]/20 px-2 py-0.5 rounded-full border border-[#5C53FE]/30">
                    Premium account
                  </span>
                </>
              ) : (
                <>
                  <h4 className="text-xs font-semibold text-white truncate">
                    {portalTitle}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-normal">
                    Professional Tier
                  </p>
                </>
              )}
            </div>
          </div>
        </SidebarHeader>

        {/* --- ২. মেনু আইটেমসমূহ --- */}
        <SidebarContent className="px-4 py-2">
          <SidebarMenu className="gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive}
                    className={`relative w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#181824] text-white font-semibold"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* একটিভ ব্লু/পার্পল ইন্ডিকেটর বার (Figma স্ক্রিনশট অনুযায়ী) */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#5C53FE] rounded-r-full" />
                    )}
                    <Icon
                      className={`size-4 shrink-0 ${
                        isActive ? "text-[#5C53FE]" : "text-gray-400"
                      }`}
                    />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </div>

      {/* --- ৩. ফুটার অংশ: বাটন এবং Logout --- */}
      <SidebarFooter className="p-4 pt-0 bg-transparent flex flex-col gap-3">
        {/* Seeker পোর্টালে সাদা বাটন: Post Resume (স্ক্রিনশটের মতো হুবহু) */}
        {currentPortal === "seeker" && (
          <Link href="/dashboard/seeker/settings" className="w-full">
            <button className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-black font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer">
              Post Resume
            </button>
          </Link>
        )}

        {/* Recruiter পোর্টালে পার্পল বাটন: Post a Job */}
        {currentPortal === "recruiter" && (
          <Link href="/dashboard/recruiter/jobs/new" className="w-full">
            <button className="w-full py-2.5 px-4 bg-[#5C53FE] hover:bg-[#4D44EE] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer">
              Post a Job
            </button>
          </Link>
        )}

        {/* লগআউট বাটন */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
