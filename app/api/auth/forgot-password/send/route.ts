/**
 * ==============================================================================
 * FILE: client/app/api/auth/forgot-password/send/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Step 1 of Forgot Password for Job Seekers & Recruiters:
 *     1. Reads `{ email }` from the request body.
 *     2. Checks that the account exists in MongoDB (`hireloopdb.user`) and belongs
 *        to a Job Seeker or Recruiter (Admin accounts use `/admin` OTP only).
 *     3. Generates a cryptographically secure 6-digit reset code, hashes it with
 *        HMAC-SHA256, and stores it in `hireloopdb.password_reset_otps` (15-min expiry).
 *     4. Sends a styled Password Reset email (code + clickable link) via Gmail Nodemailer!
 *
 * CALLED FROM FRONTEND:
 *   - `client/app/(auth)/forgot-password/_components/forgot-password-form.tsx`
 * ==============================================================================
 */

import crypto from "crypto"
import { NextResponse } from "next/server"
import { authDb } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/mailer"

const RESET_EXPIRY_MINUTES = 15

function hashResetCode(email: string, code: string) {
  const secret = process.env.BETTER_AUTH_SECRET || "hireloop_reset_secret"
  return crypto
    .createHmac("sha256", secret)
    .update(`reset:${email}:${code}`)
    .digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    // Step 1: Find the user in MongoDB (`user` collection)
    const usersCollection = authDb.collection("user")
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "No Job Seeker or Recruiter account found with that email address." },
        { status: 404 }
      )
    }

    // Admin uses passwordless OTP at `/admin` — block password reset for admin
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Password reset is only available for Job Seeker and Recruiter accounts." },
        { status: 403 }
      )
    }

    // Step 2: Generate a 6-digit numeric reset code and store its HMAC hash in MongoDB
    const code = String(crypto.randomInt(100000, 1000000))
    const codeHash = hashResetCode(email, code)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + RESET_EXPIRY_MINUTES * 60 * 1000)

    const resetsCollection = authDb.collection("password_reset_otps")
    await resetsCollection.updateMany(
      { email, used: false },
      { $set: { used: true, invalidatedAt: now } }
    )
    await resetsCollection.insertOne({
      email,
      userId: user._id,
      codeHash,
      used: false,
      attempts: 0,
      createdAt: now,
      expiresAt,
    })

    // Step 3: Build a direct clickable reset URL for convenience inside the email
    const appBase = process.env.BETTER_AUTH_URL || "http://localhost:3000"
    const resetUrl = `${appBase}/forgot-password?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`

    // Step 4: Send the styled email via Gmail Nodemailer
    await sendPasswordResetEmail({
      to: email,
      userName: user.name || "there",
      code,
      resetUrl,
      expiresInMinutes: RESET_EXPIRY_MINUTES,
    })

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${email}.`,
      expiresInMinutes: RESET_EXPIRY_MINUTES,
    })
  } catch (err) {
    console.error("[/api/auth/forgot-password/send] Error:", err)
    const message =
      err instanceof Error ? err.message : "Failed to send password reset code."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
