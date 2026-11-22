/**
 * ==============================================================================
 * FILE: client/lib/api/companies.ts
 * ==============================================================================
 * PURPOSE:
 *   Next.js Server Actions for Company profiles (Public directory, Recruiter
 *   "My Company" form, and Admin "Manage Companies" verification/deletion).
 *
 * EXPRESS API ENDPOINTS CALLED HERE:
 *   - GET    http://localhost:5001/companies            -> getCompanies()             [Public]
 *   - GET    http://localhost:5001/companies/my         -> getMyCompany()             [Recruiter/Admin]
 *   - PUT    http://localhost:5001/companies/my         -> upsertMyCompany(data)      [Recruiter/Admin]
 *   - PATCH  http://localhost:5001/companies/:id/verify -> toggleVerifyCompany(id, v) [Admin]
 *   - DELETE http://localhost:5001/companies/:id        -> deleteCompany(id)          [Admin]
 *
 * USED BY:
 *   - `client/app/company/page.tsx`
 *   - `client/app/dashboard/recruiter/my-company/page.tsx`
 *   - `client/app/dashboard/admin/companies/page.tsx`
 * ==============================================================================
 */

"use server"

import { authFetch, protectedMutation } from "@/lib/core/server"
import type { CompanyFormData, CompanyRow } from "@/lib/types/companies"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

/**
 * Calls `GET /companies` (Public) to list all companies with open job counts.
 */
export const getCompanies = async (): Promise<CompanyRow[]> => {
  try {
    const res = await fetch(`${BASE_URL}/companies`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Calls `GET /companies/my` (Recruiter/Admin) to load their own company profile.
 */
export const getMyCompany = async (): Promise<CompanyRow | null> => {
  try {
    const res = await authFetch(`${BASE_URL}/companies/my`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Calls `PUT /companies/my` (Recruiter/Admin) to create or update their company profile.
 */
export const upsertMyCompany = async (data: CompanyFormData) => {
  const res = await protectedMutation(`${BASE_URL}/companies/my`, "PUT", data)
  return res.json()
}

/**
 * Calls `PATCH /companies/:id/verify` (Admin) to verify or unverify an employer.
 */
export const toggleVerifyCompany = async (companyId: string, verified: boolean) => {
  const res = await protectedMutation(`${BASE_URL}/companies/${companyId}/verify`, "PATCH", {
    verified,
  })
  return res.json()
}

/**
 * Calls `DELETE /companies/:id` (Admin) to delete a company profile.
 */
export const deleteCompany = async (companyId: string) => {
  const res = await protectedMutation(`${BASE_URL}/companies/${companyId}`, "DELETE")
  return res.json()
}
