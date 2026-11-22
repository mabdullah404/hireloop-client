/**
 * ==============================================================================
 * FILE: client/lib/types/companies.ts
 * ==============================================================================
 * PURPOSE:
 *   TypeScript types for Company profiles (used by Recruiter My Company,
 *   Public Companies directory, and Admin Manage Companies).
 * ==============================================================================
 */

export type CompanyRow = {
  _id: string
  recruiterId: string
  name: string
  industry: string
  size: string
  location: string
  website?: string
  description?: string
  logoUrl?: string
  verified: boolean
  totalJobs?: number
  openJobs?: number
  createdAt?: string
  updatedAt?: string
}

export type CompanyFormData = {
  name: string
  industry: string
  size: string
  location: string
  website: string
  description: string
  logoUrl: string
}

export const COMPANY_SIZES = [
  "1 - 10 Employees",
  "10 - 50 Employees",
  "50 - 250 Employees",
  "250 - 500 Employees",
  "500 - 1,000 Employees",
  "1,000+ Employees",
]

export const COMPANY_INDUSTRIES = [
  "SaaS / Artificial Intelligence",
  "Developer Tools",
  "FinTech / Payments",
  "Healthcare AI",
  "E-Commerce & Retail",
  "Cloud Infrastructure",
  "Design & Creative Studio",
  "Enterprise Software",
]
