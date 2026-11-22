/**
 * ==============================================================================
 * FILE: client/app/api/auth/admin-otp/send/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Step 1 of Passwordless Admin Login (`/admin`):
 *     1. Reads `{ email }` from the request body.
 *     2. Verifies `email` matches the ONLY authorized static Admin email
 *        (`process.env.ADMIN_EMAIL`, default: `mabdullah539629@gmail.com`).
 *     3. Generates a cryptographically secure 6-digit numeric OTP code (`crypto.randomInt`).
 *     4. Stores the hashed OTP + 10-minute expiration inside MongoDB (`hireloopdb.admin_otps`),
 *        invalidating any older unused OTPs for that email.
 *     5. Sends the beautifully designed HTML email via Nodemailer (`client/lib/mailer.ts`).
 *
 * CALLED FROM FRONTEND:
 *   - `client/app/admin/_components/admin-otp-login.tsx`
 * ==============================================================================
 */

import crypto from "crypto"
import { NextResponse } from "next/server"
import { authDb } from "@/lib/auth"
import { sendAdminOtpEmail } from "@/lib/mailer"

const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "mabdullah539629@gmail.com"
)
  .trim()
  .toLowerCase()

const OTP_EXPIRY_MINUTES = 10

function hashOtp(code: string) {
  const secret = process.env.BETTER_AUTH_SECRET || "hireloop_otp_secret"
  return crypto.createHmac("sha256", secret).update(code).digest("hex")
}

export async function POST(request: Request) {
  try {
    // Step 1: Parse and normalize the email entered on `/admin`
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: "Please enter the administrator email address." },
        { status: 400 }
      )
    }

    // Step 2: Check against the static authorized Admin email
    if (email !== AUTHORIZED_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "This email address is not authorized for Admin Console access." },
        { status: 403 }
      )
    }

    // Step 3: Generate a secure 6-digit OTP code (100000 - 999999)
    const otpCode = String(crypto.randomInt(100000, 1000000))
    const codeHash = hashOtp(otpCode)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Step 4: Save the OTP in MongoDB (`admin_otps` collection)
    const otpsCollection = authDb.collection("admin_otps")

    // Invalidate any previous unused OTPs for this admin email
    await otpsCollection.updateMany(
      { email, used: false },
      { $set: { used: true, invalidatedAt: now } }
    )

    // Insert the fresh OTP record
    await otpsCollection.insertOne({
      email,
      codeHash,
      used: false,
      attempts: 0,
      createdAt: now,
      expiresAt,
    })

    // Step 5: Send the professional HTML email via Gmail Nodemailer
    await sendAdminOtpEmail({
      to: email,
      code: otpCode,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    })

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    })
  } catch (err) {
    console.error("[/api/auth/admin-otp/send] Error:", err)
    const message =
      err instanceof Error ? err.message : "Failed to send verification code."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
