/**
 * ==============================================================================
 * FILE: client/app/layout.tsx
 * ==============================================================================
 * PURPOSE:
 *   Root Next.js layout shared across EVERY page in the application.
 *   Loads the Figma font families (Geist, Geist Mono, Manrope, Space Mono),
 *   applies dark ThemeProvider, and mounts the global `<Toaster />` notification container.
 * ==============================================================================
 */

import type { Metadata } from "next"
import { Geist, Geist_Mono, Manrope, Space_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "HireLoop 2.0 — AI-Native Career & Hiring Platform",
  description:
    "Connect top talent with verified companies. Browse curated jobs, track applications, and manage hiring pipelines.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        manrope.variable,
        spaceMono.variable
      )}
    >
      <body className="bg-[#08080A] text-[#EDEDEF]">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
