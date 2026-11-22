/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/companies/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Admin Companies Management page (`/dashboard/admin/companies`).
 *   Lets the Admin verify/unverify employers and remove invalid company listings.
 *
 * API CALLS MADE HERE:
 *   - `getCompanies()`        -> `GET http://localhost:5000/companies`
 *   - `toggleVerifyCompany()` -> `PATCH http://localhost:5000/companies/:id/verify`
 *   - `deleteCompany()`       -> `DELETE http://localhost:5000/companies/:id`
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getCompanies } from "@/lib/api/companies"
import { AdminCompaniesTable } from "./_components/admin-companies-table"

export default async function AdminCompaniesPage() {
  const companies = await getCompanies()

  return (
    <PageContainer width="wide">
      <PageHeader
        overline="Admin Console"
        title="Manage Companies"
        subtitle="Verify employers, audit company profiles, and monitor active hiring teams."
      />

      <AdminCompaniesTable initialCompanies={companies} />
    </PageContainer>
  )
}
