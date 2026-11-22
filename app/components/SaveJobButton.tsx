/**
 * ==============================================================================
 * FILE: client/app/components/SaveJobButton.tsx
 * ==============================================================================
 * PURPOSE:
 *   Reusable Bookmark / Save Job toggle button.
 *   When clicked:
 *     - If user is not signed in -> redirects to `/sign-in`.
 *     - If not saved yet -> calls `saveJob(jobId)` (`POST http://localhost:5000/saved-jobs`).
 *     - If already saved -> calls `removeSavedJob(jobId)` (`DELETE http://localhost:5000/saved-jobs/:jobId`).
 *
 * USED BY:
 *   - `client/app/browse-jobs/[id]/_components/job-header-card.tsx`
 *   - `client/app/components/JobCard.tsx`
 *   - `client/app/dashboard/seeker/jobs/_components/seeker-jobs-explorer.tsx`
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSession } from "@/lib/auth-client"
import { saveJob, removeSavedJob } from "@/lib/api/saved-jobs"
import { toast } from "@/components/ui/toast"

export function SaveJobButton({
  jobId,
  jobTitle,
  initialSaved = false,
  className,
}: {
  jobId: string
  jobTitle: string
  initialSaved?: boolean
  className?: string
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [saved, setSaved] = React.useState(initialSaved)
  const [pending, setPending] = React.useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push(`/sign-in?redirectTo=/browse-jobs/${jobId}`)
      return
    }

    setPending(true)
    try {
      if (saved) {
        await removeSavedJob(jobId)
        setSaved(false)
        toast.add({
          title: "Removed from Saved Jobs",
          description: `${jobTitle} was removed from your bookmarks.`,
        })
      } else {
        await saveJob(jobId)
        setSaved(true)
        toast.add({
          title: "Job Saved",
          description: `${jobTitle} was added to your Saved Jobs list.`,
        })
      }
      router.refresh()
    } catch {
      toast.add({
        title: "Action failed",
        description: "Could not update bookmark. Please try again.",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleToggle}
      aria-label={saved ? `Remove ${jobTitle} from saved jobs` : `Save ${jobTitle}`}
      aria-pressed={saved}
      className={cn(
        "flex size-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50",
        saved
          ? "border-[#5C53FE]/60 bg-[#5C53FE]/15 text-[#8F88FF]"
          : "border-white/10 bg-[#222228] text-[#A0A0AB] hover:border-white/25 hover:text-white",
        className
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  )
}
