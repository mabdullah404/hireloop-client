/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/my-company/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Recruiter "My Company" page (`/dashboard/recruiter/my-company`).
 *   Lets recruiters create & update their Company Profile (shown on Public
 *   Companies directory and Job Details sidebar).
 *
 * API CALLS MADE HERE:
 *   - `getMyCompany()`    -> `GET http://localhost:5000/companies/my`
 *   - `upsertMyCompany()` -> `PUT http://localhost:5000/companies/my`
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getMyCompany } from "@/lib/api/companies"
import { CompanyProfileForm } from "./_components/company-profile-form"

export default async function RecruiterMyCompanyPage() {
  const company = await getMyCompany()

  return (
    <PageContainer width="default">
      <PageHeader
        overline="Employer Branding"
        title="My Company Profile"
        subtitle="Customize how your organization appears on job posts and the public Companies directory."
      />

      <CompanyProfileForm initialCompany={company} />
    </PageContainer>
  )
}
