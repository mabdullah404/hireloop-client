/**
 * ==============================================================================
 * FILE: client/app/pricing/page.tsx
 * ==============================================================================
 * PURPOSE:
 *   Dedicated `/pricing` page linked from the SiteNavbar and Footer.
 *   Reuses the exact Figma `PricingSection` component.
 * ==============================================================================
 */

import { SiteNavbar } from "@/components/site-navbar"
import { PricingSection } from "@/components/pricing-section"
import { SiteFooter } from "@/components/site-footer"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#010103] text-white">
      <SiteNavbar />
      <PricingSection />
      <SiteFooter />
    </div>
  )
}
