/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/settings/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Recruiter Profile Settings (`/dashboard/recruiter/settings`).
 *   Persists name, avatar, headline, and bio to `PATCH http://localhost:5000/users/me/profile`.
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getMyProfile } from "@/lib/api/user"
import { SeekerSettingsForm } from "../../seeker/settings/_components/seeker-settings-form"

export default async function RecruiterSettingsPage() {
  const profile = await getMyProfile()

  return (
    <PageContainer width="default">
      <PageHeader
        overline="Recruiter Account"
        title="Settings"
        subtitle="Update your recruiter profile details and account preferences."
      />

      <SeekerSettingsForm initialProfile={profile} />
    </PageContainer>
  )
}
