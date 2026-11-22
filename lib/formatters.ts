/**
 * ==============================================================================
 * FILE: client/lib/formatters.ts
 * ==============================================================================
 * PURPOSE:
 *   Shared display formatters for salaries, dates, deadlines, and relative times.
 *   Uses fixed `en-US` locale so Next.js SSR and Client hydration always match.
 * ==============================================================================
 */

import type { JobFormData } from "@/lib/types/jobs"

/** Formats min/max salary + frequency cleanly, e.g. "$140k – $180k / yr" or "$25 – $40 / hr". */
export const formatSalary = (
  minSalary?: string | number,
  maxSalary?: string | number,
  frequency = "per year"
) => {
  const min = Number(minSalary || 0)
  const max = Number(maxSalary || 0)
  if (!min && !max) return "Competitive"

  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`

  const shortFreq = frequency
    .replace("per year", "/ yr")
    .replace("per hour", "/ hr")
    .replace("per month", "/ mo")
    .replace("per week", "/ wk")
    .replace("per day", "/ day")

  return `${fmt(min)} – ${fmt(max)} ${shortFreq}`
}

/** Legacy helper preserved for recruiter jobs table. */
export const formatCompensation = (job: JobFormData) =>
  formatSalary(job.minSalary, job.maxSalary, job.salaryFrequency)

/** "2025-05-30" → "May 30, 2025". */
export const formatDate = (dateInput: string) => {
  if (!dateInput) return "—"
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return dateInput
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

export const formatDeadline = formatDate

/** ISO timestamp → "2 hours ago". */
export const formatRelativeTime = (isoDate: string) => {
  if (!isoDate) return "recently"
  const timestamp = new Date(isoDate).getTime()
  if (Number.isNaN(timestamp)) return "recently"
  const minutes = Math.floor((Date.now() - timestamp) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`
  return formatDate(isoDate)
}
