/**
 * ==============================================================================
 * FILE: client/app/dashboard/recruiter/my-company/_components/company-profile-form.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive Company Profile Form saving to `PUT http://localhost:5000/companies/my`.
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Building2 } from "lucide-react"

import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  type CompanyFormData,
  type CompanyRow,
} from "@/lib/types/companies"
import { upsertMyCompany } from "@/lib/api/companies"
import { toast } from "@/components/ui/toast"

export function CompanyProfileForm({
  initialCompany,
}: {
  initialCompany: CompanyRow | null
}) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<CompanyFormData>({
    name: initialCompany?.name || "",
    industry: initialCompany?.industry || COMPANY_INDUSTRIES[0],
    size: initialCompany?.size || COMPANY_SIZES[2],
    location: initialCompany?.location || "",
    website: initialCompany?.website || "",
    description: initialCompany?.description || "",
    logoUrl: initialCompany?.logoUrl || "",
  })

  const setField =
    (field: keyof CompanyFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await upsertMyCompany(form)
      if (res?.success) {
        toast.add({
          title: "Company profile saved",
          description: `${form.name} is now live across HireLoop.`,
        })
        router.refresh()
      } else {
        toast.add({ title: "Error", description: res?.message || "Could not save company." })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-[#141418] p-6 sm:p-8"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="brand-chip flex size-11 items-center justify-center rounded-xl">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {form.name || "Your Organization"}
            </h2>
            <p className="text-xs text-[#A0A0AB]">{form.industry}</p>
          </div>
        </div>
        {initialCompany?.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-3 py-1 text-xs font-medium text-[#22C55E]">
            <BadgeCheck className="size-3.5" /> Verified Employer
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
            Company Name *
          </label>
          <input
            required
            value={form.name}
            onChange={setField("name")}
            placeholder="e.g. CloudScale AI"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">Industry</label>
          <select
            value={form.industry}
            onChange={setField("industry")}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          >
            {COMPANY_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
            Company Size
          </label>
          <select
            value={form.size}
            onChange={setField("size")}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          >
            {COMPANY_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
            Headquarters / Location
          </label>
          <input
            value={form.location}
            onChange={setField("location")}
            placeholder="San Francisco, CA (or Remote)"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
            Company Website
          </label>
          <input
            type="url"
            value={form.website}
            onChange={setField("website")}
            placeholder="https://yourcompany.com"
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
            About Company
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={setField("description")}
            placeholder="Describe your company's mission, culture, and tech stack..."
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] p-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-brand h-11 rounded-lg px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Company Profile"}
      </button>
    </form>
  )
}
