/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/settings/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Seeker Settings page matching Figma `Seeker / Settings`:
 *     - Profile Information (Avatar, Full Name, Email)
 *     - Professional Details (Professional Headline, Bio, interactive Skills tags)
 *     - Resume Management (Resume file name/URL, Replace & Remove)
 *
 * API CALLS MADE HERE:
 *   - `getMyProfile()`    -> `GET http://localhost:5000/users/me`
 *   - `updateMyProfile()` -> `PATCH http://localhost:5000/users/me/profile`
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getMyProfile } from "@/lib/api/user"
import { SeekerSettingsForm } from "./_components/seeker-settings-form"

export default async function SeekerSettingsPage() {
  const profile = await getMyProfile()

  return (
    <PageContainer width="default">
      <PageHeader
        title="Settings"
        subtitle="Manage your account details, professional profile, skills, and resume."
      />

      <SeekerSettingsForm initialProfile={profile} />
    </PageContainer>
  )
}
