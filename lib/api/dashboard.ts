/**
 * ==============================================================================
 * FILE: client/lib/api/dashboard.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for the 3 role dashboard homepages + Admin Demo Seeder.
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET  http://localhost:5001/dashboard/seeker/stats    -> getSeekerStats()    [Auth]
 *   - GET  http://localhost:5001/dashboard/recruiter/stats -> getRecruiterStats() [Recruiter/Admin]
 *   - GET  http://localhost:5001/dashboard/admin/stats     -> getAdminStats()     [Admin]
 *   - POST http://localhost:5001/admin/seed-demo           -> seedDemoData()      [Admin]
 *
 * USED BY:
 *   - `client/app/dashboard/seeker/page.tsx`
 *   - `client/app/dashboard/recruiter/page.tsx`
 *   - `client/app/dashboard/admin/page.tsx`
 *   - `client/app/dashboard/admin/settings/page.tsx`
 * ==============================================================================
 */

"use server"

import { authFetch, protectedMutation } from "@/lib/core/server"
import type { ApplicationRow } from "@/lib/types/applications"
import type { PaymentRow } from "@/lib/types/payments"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

export type SeekerActivity = {
  id: string
  type: "application" | "alert"
  title: string
  timestamp: string
  href: string
}

export type SeekerDashboardStats = {
  savedJobs: number
  applicationsSubmitted: number
  interviewsScheduled: number
  offersReceived: number
  activities: SeekerActivity[]
}

export type RecruiterDashboardStats = {
  totalJobPosts: number
  totalApplicants: number
  activeJobs: number
  closedJobs: number
  recentApplications: ApplicationRow[]
}

export type AdminDashboardStats = {
  totalUsers: number
  totalRecruiters: number
  totalCompanies: number
  jobsPosted: number
  activeJobs: number
  totalApplications: number
  platformRevenue: number
  monthlyRevenue: number
  recentTransactions: PaymentRow[]
}

export const getSeekerStats = async (): Promise<SeekerDashboardStats> => {
  try {
    const res = await authFetch(`${BASE_URL}/dashboard/seeker/stats`)
    if (!res.ok) {
      return {
        savedJobs: 0,
        applicationsSubmitted: 0,
        interviewsScheduled: 0,
        offersReceived: 0,
        activities: [],
      }
    }
    return res.json()
  } catch {
    return {
      savedJobs: 0,
      applicationsSubmitted: 0,
      interviewsScheduled: 0,
      offersReceived: 0,
      activities: [],
    }
  }
}

export const getRecruiterStats = async (): Promise<RecruiterDashboardStats> => {
  try {
    const res = await authFetch(`${BASE_URL}/dashboard/recruiter/stats`)
    if (!res.ok) {
      return {
        totalJobPosts: 0,
        totalApplicants: 0,
        activeJobs: 0,
        closedJobs: 0,
        recentApplications: [],
      }
    }
    return res.json()
  } catch {
    return {
      totalJobPosts: 0,
      totalApplicants: 0,
      activeJobs: 0,
      closedJobs: 0,
      recentApplications: [],
    }
  }
}

export const getAdminStats = async (): Promise<AdminDashboardStats> => {
  try {
    const res = await authFetch(`${BASE_URL}/dashboard/admin/stats`)
    if (!res.ok) {
      return {
        totalUsers: 0,
        totalRecruiters: 0,
        totalCompanies: 0,
        jobsPosted: 0,
        activeJobs: 0,
        totalApplications: 0,
        platformRevenue: 0,
        monthlyRevenue: 0,
        recentTransactions: [],
      }
    }
    return res.json()
  } catch {
    return {
      totalUsers: 0,
      totalRecruiters: 0,
      totalCompanies: 0,
      jobsPosted: 0,
      activeJobs: 0,
      totalApplications: 0,
      platformRevenue: 0,
      monthlyRevenue: 0,
      recentTransactions: [],
    }
  }
}

/**
 * Calls `POST /admin/seed-demo` (Admin only) to insert sample Figma companies,
 * jobs, and transactions into MongoDB in one click.
 */
export const seedDemoData = async () => {
  const res = await protectedMutation(`${BASE_URL}/admin/seed-demo`, "POST", {})
  return res.json()
}
