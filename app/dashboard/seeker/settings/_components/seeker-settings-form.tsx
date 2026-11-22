/**
 * ==============================================================================
 * FILE: client/app/dashboard/seeker/settings/_components/seeker-settings-form.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive 3-card Settings form directly matching Figma `Seeker / Settings`:
 *     1. Profile Information (Change Avatar, Full Name, Email, Update Profile)
 *     2. Professional Details (Headline, Bio, interactive Skills pill editor, Save Details)
 *     3. Resume (File name & Resume URL, Replace / Remove)
 *   Persists directly to MongoDB via `PATCH http://localhost:5000/users/me/profile`!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, Plus, Trash2, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { updateMyProfile, type UserProfileData } from "@/lib/api/user"
import { UserAvatar } from "@/components/shared/user-avatar"
import { toast } from "@/components/ui/toast"

export function SeekerSettingsForm({
  initialProfile,
}: {
  initialProfile: UserProfileData | null
}) {
  const router = useRouter()

  const [name, setName] = React.useState(initialProfile?.name || "")
  const [image, setImage] = React.useState(initialProfile?.image || "")
  const [headline, setHeadline] = React.useState(initialProfile?.headline || "")
  const [bio, setBio] = React.useState(initialProfile?.bio || "")
  const [skills, setSkills] = React.useState<string[]>(
    initialProfile?.skills?.length ? initialProfile.skills : ["React", "TypeScript", "UI/UX"]
  )
  const [skillInput, setSkillInput] = React.useState("")
  const [resumeName, setResumeName] = React.useState(initialProfile?.resumeName || "")
  const [resumeUrl, setResumeUrl] = React.useState(initialProfile?.resumeUrl || "")
  const [savingSection, setSavingSection] = React.useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)

  // Uploads avatar photo to Cloudinary CDN (`POST /api/upload`) and stores live HTTPS URL
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: "File too large", description: "Maximum avatar size is 5MB." })
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "hireloop/avatars")

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await res.json()

      if (!res.ok || !result?.url) {
        toast.add({
          title: "Upload failed",
          description: result?.error || "Could not upload avatar to Cloudinary.",
        })
        return
      }

      setImage(result.url)
      toast.add({
        title: "Avatar uploaded",
        description: "Click 'Update Profile' to save your new Cloudinary photo.",
      })
    } catch {
      toast.add({ title: "Upload error", description: "Network error while uploading image." })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed || skills.includes(trimmed)) return
    setSkills((prev) => [...prev, trimmed])
    setSkillInput("")
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const saveProfileSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSection("profile")
    try {
      await updateMyProfile({ name: name.trim(), image })
      toast.add({ title: "Profile updated", description: "Your name and avatar were saved." })
      router.refresh()
    } finally {
      setSavingSection(null)
    }
  }

  const saveProfessionalSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSection("details")
    try {
      await updateMyProfile({ headline: headline.trim(), bio: bio.trim(), skills })
      toast.add({
        title: "Professional details saved",
        description: "Your headline, bio, and skills are updated.",
      })
      router.refresh()
    } finally {
      setSavingSection(null)
    }
  }

  const saveResumeSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSection("resume")
    try {
      await updateMyProfile({
        resumeName: resumeName.trim() || "My_Resume.pdf",
        resumeUrl: resumeUrl.trim(),
        resumeUpdatedAt: new Date().toISOString(),
      })
      toast.add({ title: "Resume saved", description: "Your resume is ready for 1-click apply." })
      router.refresh()
    } finally {
      setSavingSection(null)
    }
  }

  const removeResume = async () => {
    setSavingSection("resume")
    try {
      await updateMyProfile({ resumeName: "", resumeUrl: "", resumeUpdatedAt: null })
      setResumeName("")
      setResumeUrl("")
      toast.add({ title: "Resume removed", description: "Your resume was removed from profile." })
      router.refresh()
    } finally {
      setSavingSection(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Profile Information Card */}
      <form
        onSubmit={saveProfileSection}
        className="rounded-2xl border border-white/10 bg-[#141418] p-6"
      >
        <h2 className="text-xl font-semibold text-[#EDEDEF]">Profile Information</h2>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <UserAvatar src={image} name={name} className="size-16" />
          <div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-[#1B1B20] px-3.5 text-xs font-medium text-[#EDEDEF] hover:border-white/30">
              <Upload className="size-3.5" />
              {uploadingAvatar ? "Uploading to CDN..." : "Change Avatar"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploadingAvatar}
                className="sr-only"
                onChange={handleAvatarFile}
              />
            </label>
            <p className="mt-1.5 text-xs text-[#A0A0AB]">JPG, PNG, WebP or GIF. Max size of 5MB.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
              Email Address
            </label>
            <input
              value={initialProfile?.email || ""}
              disabled
              className="h-11 w-full cursor-not-allowed rounded-lg border border-white/10 bg-[#0F0F12]/60 px-3.5 text-sm text-[#A0A0AB]"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingSection === "profile"}
            className="h-10 rounded-lg bg-[#FAFAFA] px-5 text-xs font-semibold text-[#0B0B0C] hover:bg-white disabled:opacity-60"
          >
            {savingSection === "profile" ? "Saving..." : "Update Profile"}
          </button>
          <Link
            href={`/forgot-password?email=${encodeURIComponent(initialProfile?.email || "")}`}
            className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-[#1B1B20] px-4 text-xs font-medium text-[#EDEDEF] transition-colors hover:border-white/30 hover:text-white"
          >
            Reset Password
          </Link>
        </div>
      </form>

      {/* 2. Professional Details Card */}
      <form
        onSubmit={saveProfessionalSection}
        className="rounded-2xl border border-white/10 bg-[#141418] p-6"
      >
        <h2 className="text-xl font-semibold text-[#EDEDEF]">Professional Details</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
              Professional Headline
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior UX/UI Designer or Full Stack Engineer"
              className="h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell recruiters about your experience and achievements..."
              className="w-full rounded-lg border border-white/10 bg-[#0F0F12] p-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1E1E25] px-3 py-1 text-xs text-[#EDEDEF]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="text-[#A0A0AB] hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Add a skill..."
                className="h-10 flex-1 rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/15 bg-[#1B1B20] px-3.5 text-xs font-medium text-white hover:border-white/30"
              >
                <Plus className="size-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={savingSection === "details"}
            className="h-10 rounded-lg bg-[#FAFAFA] px-5 text-xs font-semibold text-[#0B0B0C] hover:bg-white disabled:opacity-60"
          >
            {savingSection === "details" ? "Saving..." : "Save Details"}
          </button>
        </div>
      </form>

      {/* 3. Resume Card */}
      <form
        onSubmit={saveResumeSection}
        className="rounded-2xl border border-white/10 bg-[#141418] p-6"
      >
        <h2 className="text-xl font-semibold text-[#EDEDEF]">Resume</h2>
        <p className="mt-1 text-xs text-[#A0A0AB]">
          Attach your latest resume link (Google Drive, Portfolio PDF, or file name) to enable
          one-click applications.
        </p>

        {resumeName ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0F0F12] p-4">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-[#8F88FF]" />
              <div>
                <p className="text-sm font-medium text-[#EDEDEF]">{resumeName}</p>
                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#8F88FF] underline"
                  >
                    {resumeUrl}
                  </a>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={removeResume}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#FFB4AB] hover:text-red-400"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
              Resume File Label
            </label>
            <input
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="Jane_Doe_Resume_2026.pdf"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#EDEDEF]">
              Resume Link (URL)
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3.5 text-sm text-[#EDEDEF] outline-none focus:border-[#5C53FE]"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={savingSection === "resume"}
            className="h-10 rounded-lg bg-[#FAFAFA] px-5 text-xs font-semibold text-[#0B0B0C] hover:bg-white disabled:opacity-60"
          >
            {savingSection === "resume" ? "Saving..." : "Save Resume"}
          </button>
        </div>
      </form>
    </div>
  )
}
