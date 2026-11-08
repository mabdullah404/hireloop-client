"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-[#030308]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="HireLoop"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="text-white hover:bg-white/10"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Menu Links & Buttons */}
        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row w-full md:w-auto items-center gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0`}
        >
          {/* Links */}
          <Link
            href="/jobs"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Browse Jobs
          </Link>
          <Link
            href="/companies"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Company
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="text-sm font-normal text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>

          {/* Vertical Divider (Only on desktop) */}
          <div className="hidden md:block w-px h-4 bg-white/20" />

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto pt-2 md:pt-0">
            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="text-sm font-normal text-white hover:text-gray-300 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setIsOpen(false)}
              className="w-full md:w-auto"
            >
              <Button
                size="sm"
                className="w-full md:w-auto bg-[#5C53FE] hover:bg-[#4D44EE] text-white px-5 rounded-lg text-sm font-medium shadow-md shadow-[#5C53FE]/30 transition-all"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
