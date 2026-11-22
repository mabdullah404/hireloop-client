/**
 * ==============================================================================
 * FILE: client/app/dashboard/admin/settings/_components/admin-settings-client.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Admin Settings panel with:
 *     - Static Admin account info card
 *     - 1-Click "Seed Demo Data" button (`POST http://localhost:5000/admin/seed-demo`)
 *       that populates realistic Figma Companies, Jobs, and Payment transactions!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Database, ShieldCheck, Sparkles } from "lucide-react"

import type { UserProfileData } from "@/lib/api/user"
import { seedDemoData } from "@/lib/api/dashboard"
import { toast } from "@/components/ui/toast"

export function AdminSettingsClient({
  profile,
}: {
  profile: UserProfileData | null
}) {
  const router = useRouter()
  const [seeding, setSeeding] = React.useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await seedDemoData()
      if (res?.success) {
        toast.add({
          title: "Demo data seeded!",
          description: `Inserted ${res.insertedJobsCount ?? 0} sample jobs plus verified companies & transactions.`,
        })
        router.refresh()
      } else {
        toast.add({ title: "Seed failed", description: res?.message || "Please try again." })
      }
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Static Admin Credentials Reference Card */}
      <section className="rounded-2xl border border-white/10 bg-[#141418] p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Passwordless Admin Account</h2>
            <p className="text-xs text-[#A0A0AB]">
              Secured via 6-digit Gmail OTP at <code>/admin</code> (configured in <code>ADMIN_EMAIL</code>)
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-[#0F0F12] p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#A0A0AB]">Signed-in Admin</dt>
            <dd className="mt-1 font-medium text-white">{profile?.name || "HireLoop Admin"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#A0A0AB]">Authorized Admin Email</dt>
            <dd className="mt-1 font-mono text-xs text-[#8F88FF]">
              {profile?.email || "mabdullah539629@gmail.com"}
            </dd>
          </div>
        </dl>
      </section>

      {/* One-Click Demo Seeder */}
      <section className="rounded-2xl border border-[#5C53FE]/30 bg-[#14141A] p-6">
        <div className="flex items-start gap-3">
          <div className="brand-chip flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Database className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">
              Seed Sample HireLoop Data
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#A0A0AB]">
              Populates MongoDB (`hireloopdb`) with 6 realistic Figma job listings
              (CloudScale AI, FinGrid Solutions, TechFlow Systems, HealthAI Corp),
              4 verified company profiles, and sample subscription transactions so
              every public and dashboard view has live data for testing &amp; teaching.
            </p>

            <button
              type="button"
              disabled={seeding}
              onClick={handleSeed}
              className="btn-brand mt-4 inline-flex h-10 items-center gap-2 rounded-lg px-5 text-xs font-semibold text-white disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {seeding ? "Seeding MongoDB..." : "Seed Demo Data Now"}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
