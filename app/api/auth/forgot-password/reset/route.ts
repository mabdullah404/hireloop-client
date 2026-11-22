/**
 * ==============================================================================
 * FILE: client/app/api/auth/forgot-password/reset/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Step 2 of Forgot Password for Job Seekers & Recruiters:
 *     1. Reads `{ email, code, newPassword }`.
 *     2. Validates the 6-digit code against MongoDB (`hireloopdb.password_reset_otps`):
 *        checks unused, unexpired (< 15 min), < 5 attempts, and timing-safe hash match.
 *     3. Marks the reset code as `used: true`.
 *     4. Hashes `newPassword` using Better Auth's official `hashPassword` (`better-auth/crypto`)
 *        and updates (or creates) the user's `credential` account in `hireloopdb.account`.
 *     5. Revokes old active sessions in `hireloopdb.session` so compromised sessions log out.
 *
 * CALLED FROM FRONTEND:
 *   - `client/app/(auth)/forgot-password/_components/forgot-password-form.tsx`
 * ==============================================================================
 */

import crypto from "crypto"
import { NextResponse } from "next/server"
import { hashPassword } from "better-auth/crypto"
import { authDb } from "@/lib/auth"

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
    const code = String(body.code || "").replace(/\s+/g, "")
    const newPassword = String(body.newPassword || "")

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please provide your email and the 6-digit reset code." },
        { status: 400 }
      )
    }

    if (newPassword.length < 6 || newPassword.length > 72) {
      return NextResponse.json(
        { error: "New password must be between 6 and 72 characters." },
        { status: 400 }
      )
    }

    // Step 1: Load user & block admin
    const usersCollection = authDb.collection("user")
    const user = await usersCollection.findOne({ email })
    if (!user || user.role === "admin") {
      return NextResponse.json(
        { error: "Invalid account for password reset." },
        { status: 403 }
      )
    }

    // Step 2: Verify the latest active reset OTP record
    const resetsCollection = authDb.collection("password_reset_otps")
    const record = await resetsCollection.findOne(
      { email, used: false },
      { sort: { createdAt: -1 } }
    )

    if (!record) {
      return NextResponse.json(
        { error: "No active reset code found. Please request a new code." },
        { status: 400 }
      )
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await resetsCollection.updateOne({ _id: record._id }, { $set: { used: true } })
      return NextResponse.json(
        { error: "This reset code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    if ((record.attempts || 0) >= 5) {
      await resetsCollection.updateOne({ _id: record._id }, { $set: { used: true } })
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new reset code." },
        { status: 429 }
      )
    }

    const expectedHash = String(record.codeHash || "")
    const actualHash = hashResetCode(email, code)
    const isMatch =
      expectedHash.length === actualHash.length &&
      crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash))

    if (!isMatch) {
      await resetsCollection.updateOne({ _id: record._id }, { $inc: { attempts: 1 } })
      return NextResponse.json(
        { error: "Invalid reset code. Please check your email and try again." },
        { status: 401 }
      )
    }

    // Step 3: Consume the OTP immediately
    await resetsCollection.updateOne(
      { _id: record._id },
      { $set: { used: true, usedAt: new Date() } }
    )

    // Step 4: Hash the new password with Better Auth's exact crypto algorithm and save
    const hashedPassword = await hashPassword(newPassword)
    const accountsCollection = authDb.collection("account")
    const now = new Date()

    await accountsCollection.updateOne(
      {
        $or: [{ userId: user._id }, { userId: user._id.toString() }],
        providerId: "credential",
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: now,
        },
        $setOnInsert: {
          accountId: user._id.toString(),
          providerId: "credential",
          userId: user._id,
          createdAt: now,
        },
      },
      { upsert: true }
    )

    // Step 5: Revoke old sessions for account safety
    const sessionsCollection = authDb.collection("session")
    await sessionsCollection.deleteMany({
      $or: [{ userId: user._id }, { userId: user._id.toString() }],
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully! You can now sign in with your new password.",
    })
  } catch (err) {
    console.error("[/api/auth/forgot-password/reset] Error:", err)
    const message = err instanceof Error ? err.message : "Failed to reset password."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
