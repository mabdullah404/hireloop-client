/**
 * ==============================================================================
 * FILE: client/app/checkout/_components/checkout-client.tsx
 * ==============================================================================
 * PURPOSE:
 *   Interactive 2-column Checkout layout matching Figma `Public / Checkout — Stripe Payment`:
 *     - Left Column (Order Summary):
 *         - Currency switcher: BDT (`1 USD = 127.6665 BDT`) vs USD
 *         - Selected plan name, description, subtotal, and total
 *     - Right Column (Payment Form):
 *         - Contact Information (Email)
 *         - Card Information (Card number, MM/YY, CVC, Cardholder Name, Country)
 *         - Pay button -> calls `processSandboxCheckout()` (`POST http://localhost:5000/payments/checkout-sandbox`)
 *           and redirects directly to `/checkout/success?session_id=...`!
 * ==============================================================================
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { processSandboxCheckout } from "@/lib/actions/payments"
import { toast } from "@/components/ui/toast"

const USD_TO_BDT_RATE = 127.6665

export function CheckoutClient({
  planId,
  planName,
  planDescription,
  usdAmount,
  billingCycle,
  userEmail,
  userName,
  isLoggedIn,
}: {
  planId: string
  planName: string
  planDescription: string
  usdAmount: number
  billingCycle: "monthly" | "yearly"
  userEmail: string
  userName: string
  isLoggedIn: boolean
}) {
  const router = useRouter()

  const [currency, setCurrency] = React.useState<"BDT" | "USD">("USD")
  const [email, setEmail] = React.useState(userEmail)
  const [cardNumber, setCardNumber] = React.useState("4242 4242 4242 4242")
  const [expiry, setExpiry] = React.useState("12 / 28")
  const [cvc, setCvc] = React.useState("424")
  const [cardholderName, setCardholderName] = React.useState(userName || "")
  const [country, setCountry] = React.useState("Bangladesh")
  const [saveInfo, setSaveInfo] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const bdtAmount = usdAmount * USD_TO_BDT_RATE
  const formattedBdt = `BDT ${bdtAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  const formattedUsd = `$${usdAmount.toFixed(2)}`
  const displayAmount = currency === "BDT" ? formattedBdt : formattedUsd

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isLoggedIn) {
      router.push(`/sign-in?redirectTo=/checkout?plan=${planId}&cycle=${billingCycle}`)
      return
    }

    setSubmitting(true)
    try {
      const digitsOnly = cardNumber.replace(/\D/g, "")
      const res = await processSandboxCheckout({
        plan: planId,
        planName,
        amount: usdAmount,
        currency,
        billingCycle,
        cardLast4: digitsOnly.slice(-4) || "4242",
        cardholderName: cardholderName.trim() || userName || "HireLoop Member",
      })

      if (!res?.success || !res?.sessionId) {
        setError(res?.message || "Payment failed. Please try again.")
        setSubmitting(false)
        return
      }

      toast.add({
        title: "Payment successful!",
        description: `Your ${planName} subscription is now active.`,
      })

      router.push(`/checkout/success?session_id=${encodeURIComponent(res.sessionId)}`)
    } catch {
      setError("Could not process checkout. Make sure the Express server is running on port 5000.")
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-12 px-4 pb-20 pt-2 lg:grid-cols-2">
      {/* LEFT COLUMN: Order Summary & Currency Switcher */}
      <section>
        <p className="text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">
          Choose a currency:
        </p>

        {/* BDT / USD Currency Switcher Cards (from Figma) */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCurrency("BDT")}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              currency === "BDT"
                ? "border-[#5C53FE] bg-[#14141C] text-white"
                : "border-[#2E2E33] bg-[#101014] text-[#A1A1AA] hover:border-white/25"
            )}
          >
            <p className="text-base font-semibold">{formattedBdt}</p>
            <p className="mt-0.5 text-xs text-[#808089]">Bangladeshi Taka</p>
          </button>

          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              currency === "USD"
                ? "border-[#5C53FE] bg-[#14141C] text-white"
                : "border-[#2E2E33] bg-[#101014] text-[#A1A1AA] hover:border-white/25"
            )}
          >
            <p className="text-base font-semibold">{formattedUsd}</p>
            <p className="mt-0.5 text-xs text-[#808089]">US Dollar</p>
          </button>
        </div>

        <p className="mt-2 text-xs italic text-[#808089]">
          1 USD = {USD_TO_BDT_RATE} BDT
        </p>

        {/* Plan Details */}
        <div className="mt-8 flex items-start justify-between gap-4 border-b border-[#2E2E33] pb-6">
          <div>
            <h1 className="text-lg font-semibold text-white">{planName}</h1>
            <p className="mt-1 text-sm text-[#A1A1AA]">{planDescription}</p>
            <p className="mt-2 text-xs capitalize text-[#8F88FF]">
              Billing cycle: {billingCycle}
            </p>
          </div>
          <p className="whitespace-nowrap text-lg font-semibold text-white">
            {displayAmount}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between text-lg font-semibold text-white">
          <span>Total due today</span>
          <span>{displayAmount}</span>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-[#141418] p-4 text-xs text-[#A1A1AA]">
          <p className="font-medium text-white">Sandbox Demo Payment</p>
          <p className="mt-1 leading-relaxed">
            No real money is charged. Submitting this form records a real payment
            transaction in MongoDB (`payments`) and immediately upgrades your account
            to Pro/Premium!
          </p>
        </div>
      </section>

      {/* RIGHT COLUMN: Stripe-Style Payment Form */}
      <section>
        {/* Express Link Banner from Figma */}
        <button
          type="button"
          onClick={handlePay}
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00D66F] text-sm font-bold text-[#18181B] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <span>Pay with link</span>
          <span className="opacity-50">|</span>
          <span className="rounded bg-[#18181B] px-1.5 py-0.5 text-[10px] text-white">
            VISA
          </span>
          <span>4242</span>
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#2E2E33]" />
          <span className="text-xs font-bold text-[#808089]">OR</span>
          <div className="h-px flex-1 bg-[#2E2E33]" />
        </div>

        <form onSubmit={handlePay} className="space-y-5">
          {/* Contact Information */}
          <div>
            <h2 className="text-sm font-semibold text-white">Contact information</h2>
            <label className="mt-2 block text-xs text-[#A1A1AA]" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1.5 h-11 w-full rounded-lg border border-[#2E2E33] bg-[#141418] px-3.5 text-sm text-white outline-none focus:border-[#5C53FE]"
            />
          </div>

          {/* Payment Method Card Box */}
          <div>
            <h2 className="text-sm font-semibold text-white">Payment method</h2>
            <div className="mt-2 overflow-hidden rounded-lg border border-[#2E2E33] bg-[#141418]">
              <div className="flex items-center gap-2.5 border-b border-[#2E2E33] bg-[#1D1D22] px-4 py-3">
                <CreditCard className="size-4 text-[#A1A1AA]" />
                <span className="text-sm font-medium text-white">Card</span>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <label className="text-[11px] font-bold tracking-wider text-[#808089] uppercase">
                    Card information
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 1234 1234 1234"
                    className="mt-1.5 h-10 w-full rounded-t-lg border border-[#2E2E33] bg-[#0F0F12] px-3 text-sm text-white outline-none focus:border-[#5C53FE]"
                  />
                  <div className="grid grid-cols-2">
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM / YY"
                      className="h-10 rounded-bl-lg border border-t-0 border-[#2E2E33] bg-[#0F0F12] px-3 text-sm text-white outline-none focus:border-[#5C53FE]"
                    />
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="h-10 rounded-br-lg border border-t-0 border-l-0 border-[#2E2E33] bg-[#0F0F12] px-3 text-sm text-white outline-none focus:border-[#5C53FE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-[#808089] uppercase">
                    Cardholder name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full name on card"
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2E2E33] bg-[#0F0F12] px-3 text-sm text-white outline-none focus:border-[#5C53FE]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-wider text-[#808089] uppercase">
                    Country or region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-[#2E2E33] bg-[#0F0F12] px-3 text-sm text-white outline-none focus:border-[#5C53FE]"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save Info Checkbox */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#2E2E33] bg-[#141418] p-3.5">
            <input
              type="checkbox"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="mt-0.5 accent-[#5C53FE]"
            />
            <span className="text-xs leading-relaxed text-[#A1A1AA]">
              <strong className="block text-white">
                Save my information for faster checkout
              </strong>
              Pay securely on this site and everywhere Link is accepted.
            </span>
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-14 w-full rounded-lg bg-[#0070E0] text-base font-bold text-white shadow-[0_4px_12px_rgba(0,112,224,0.35)] transition-colors hover:bg-[#1982EC] disabled:opacity-60"
          >
            {submitting
              ? "Processing Payment..."
              : isLoggedIn
              ? `Pay ${displayAmount}`
              : "Sign In & Pay"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-[#808089]">
            <Lock className="size-3.5" />
            Powered by Stripe &bull; Terms &bull; Privacy
          </p>
        </form>
      </section>
    </main>
  )
}
