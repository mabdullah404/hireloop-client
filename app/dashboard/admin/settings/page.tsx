/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/settings/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Admin Settings & Platform Controls page (`/dashboard/admin/settings`).
 *   Displays static admin credentials summary + 1-click "Seed Demo Data" utility
 *   calling `POST http://localhost:5000/admin/seed-demo`.
 * ==============================================================================
 */

import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { getMyProfile } from "@/lib/api/user"
import { AdminSettingsClient } from "./_components/admin-settings-client"

export default async function AdminSettingsPage() {
  const profile = await getMyProfile()

  return (
    <PageContainer width="default">
      <PageHeader
        overline="Admin Console"
        title="Platform Settings"
        subtitle="Manage administrator credentials, seed realistic sample data, and check system status."
      />

      <AdminSettingsClient profile={profile} />
    </PageContainer>
  )
}
