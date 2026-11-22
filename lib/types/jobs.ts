/**
 * ==============================================================================
 * FILE: client/lib/types/jobs.ts
 * ==============================================================================
 * PURPOSE:
 *   Central TypeScript types & dropdown options for Jobs across the entire app.
 *   Both the Public Browse Jobs page, Job Details page, Recruiter Add/Edit Job
 *   forms, and Admin Manage Jobs table import these exact types.
 * ==============================================================================
 */

export type JobType = "full-time" | "part-time" | "contract" | "internship" | "freelance"
export type JobStatus = "active" | "closed" | "expired"

export type CompanyInfoSnapshot = {
  _id?: string
  name: string
  industry?: string
  size?: string
  location?: string
  website?: string
  description?: string
  logoUrl?: string
  verified?: boolean
}

export type JobFormData = {
  title: string
  companyName: string
  companyId?: string
  recruiterId: string
  category: string
  jobType: JobType
  isRemote: boolean
  location: string
  deadline: string
  minSalary: string
  maxSalary: string
  salaryFrequency: string
  experience?: string
  description?: string
  responsibilities: string
  requirements: string
  skills?: string[]
  benefits?: string[]
  applicants: number
  status: JobStatus
  isHot?: boolean
}

export const JOB_TYPES: JobType[] = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
]

export const JOB_CATEGORIES = [
  "Engineering & Tech",
  "Design",
  "Product",
  "Marketing",
  "Infrastructure",
  "Quality",
  "Data & AI",
]

export const SALARY_FREQUENCIES = [
  "per hour",
  "per day",
  "per week",
  "per month",
  "per year",
]

export type JobRow = JobFormData & {
  _id: string
  refCode?: string
  posted: string
  createdAt?: string
  updatedAt?: string
  companyInfo?: CompanyInfoSnapshot | null
}
