/**
 * ==============================================================================
 * FILE: client/app/api/auth/admin-otp/verify/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Step 2 of Passwordless Admin Login (`/admin`):
 *     1. Reads `{ email, code }` from the request body.
 *     2. Checks that `email` matches the static authorized Admin email (`mabdullah539629@gmail.com`).
 *     3. Looks up the latest active OTP in MongoDB (`hireloopdb.admin_otps`) and checks:
 *          - Not already used
 *          - Not expired (within 10 minutes)
 *          - Fewer than 5 failed attempts
 *          - HMAC-SHA256 hash matches the entered 6-digit code
 *     4. Marks the OTP as `used: true` so it cannot be replayed.
 *     5. Ensures the Admin user exists in MongoDB via Better Auth with `role: "admin"`,
 *        signs them in using a server-derived internal secret password (admin NEVER
 *        types a password!), and forwards the genuine Better Auth `Set-Cookie` header!
 *     6. Result: Admin is logged into `/dashboard/admin` with a 100% real Better Auth
 *        session token verified by both Next.js `requireRole("admin")` and Express `verifyAdmin`!
 *
 * CALLED FROM FRONTEND:
 *   - `client/app/admin/_components/admin-otp-login.tsx`
 * ==============================================================================
 */

import crypto from "crypto"
import { NextResponse } from "next/server"
import { auth, authDb } from "@/lib/auth"

const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "mabdullah539629@gmail.com"
)
  .trim()
  .toLowerCase()

function hashOtp(code: string) {
  const secret = process.env.BETTER_AUTH_SECRET || "hireloop_otp_secret"
  return crypto.createHmac("sha256", secret).update(code).digest("hex")
}

// Internal server-only secret used ONLY behind the scenes to create a real Better Auth
// session after the email OTP has been cryptographically verified. Never exposed to the UI.
function getInternalAdminSecret() {
  const secret = process.env.BETTER_AUTH_SECRET || "hireloop_internal_secret"
  return crypto
    .createHmac("sha256", secret)
    .update(`internal-admin-session:${AUTHORIZED_ADMIN_EMAIL}`)
    .digest("hex")
    .slice(0, 48)
}

export async function POST(request: Request) {
  try {
    // Step 1: Parse email & 6-digit code
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const code = String(body.code || "").replace(/\s+/g, "")

    if (!email || email !== AUTHORIZED_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized administrator email." },
        { status: 403 }
      )
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit numeric code from your email." },
        { status: 400 }
      )
    }

    // Step 2: Find the latest unused OTP record for this admin email
    const otpsCollection = authDb.collection("admin_otps")
    const otpRecord = await otpsCollection.findOne(
      { email, used: false },
      { sort: { createdAt: -1 } }
    )

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No active verification code found. Please request a new code." },
        { status: 400 }
      )
    }

    // Step 3: Check expiration
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await otpsCollection.updateOne({ _id: otpRecord._id }, { $set: { used: true } })
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Step 4: Rate-limit brute-force guesses (max 5 attempts per code)
    if ((otpRecord.attempts || 0) >= 5) {
      await otpsCollection.updateOne({ _id: otpRecord._id }, { $set: { used: true } })
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new verification code." },
        { status: 429 }
      )
    }

    // Step 5: Constant-time hash comparison
    const expectedHash = String(otpRecord.codeHash || "")
    const actualHash = hashOtp(code)
    const isMatch =
      expectedHash.length === actualHash.length &&
      crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash))

    if (!isMatch) {
      await otpsCollection.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      )
      return NextResponse.json(
        { error: "Invalid verification code. Please double-check your email and try again." },
        { status: 401 }
      )
    }

    // Step 6: Mark the OTP as consumed immediately so it cannot be reused
    await otpsCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { used: true, verifiedAt: new Date() } }
    )

    // Step 7: Ensure the admin user account exists in Better Auth with role = "admin"
    const internalSecret = getInternalAdminSecret()
    const usersCollection = authDb.collection("user")
    const existingAdmin = await usersCollection.findOne({ email })

    if (!existingAdmin) {
      await auth.api.signUpEmail({
        body: {
          name: "HireLoop Admin",
          email,
          password: internalSecret,
          role: "admin",
        },
      })
    }

    // Guarantee admin privileges and active status
    await usersCollection.updateOne(
      { email },
      {
        $set: {
          role: "admin",
          banned: false,
          premium: true,
          plan: "premium",
        },
      }
    )

    // Step 8: Issue a genuine Better Auth session cookie via signInEmail
    let signInResponse = await auth.api.signInEmail({
      body: {
        email,
        password: internalSecret,
        rememberMe: true,
      },
      asResponse: true,
    })

    // Edge case: If `mabdullah539629@gmail.com` previously signed up with another password,
    // reset its credential account cleanly via Better Auth's internal hash & retry sign-in
    if (!signInResponse.ok && existingAdmin) {
      const accountsCollection = authDb.collection("account")
      const { hashPassword } = await import("better-auth/crypto")
      const hashedPassword = await hashPassword(internalSecret)
      await accountsCollection.updateOne(
        { userId: existingAdmin._id, providerId: "credential" },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            accountId: existingAdmin._id.toString(),
            providerId: "credential",
            userId: existingAdmin._id,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      )

      signInResponse = await auth.api.signInEmail({
        body: {
          email,
          password: internalSecret,
          rememberMe: true,
        },
        asResponse: true,
      })
    }

    if (!signInResponse.ok) {
      return NextResponse.json(
        { error: "OTP verified, but failed to create admin session." },
        { status: 500 }
      )
    }

    // Step 9: Forward Better Auth's Set-Cookie headers back to the browser
    const response = NextResponse.json({
      success: true,
      role: "admin",
      redirectTo: "/dashboard/admin",
    })

    const setCookies =
      typeof signInResponse.headers.getSetCookie === "function"
        ? signInResponse.headers.getSetCookie()
        : [signInResponse.headers.get("set-cookie")].filter(Boolean)

    for (const cookie of setCookies) {
      if (cookie) response.headers.append("set-cookie", cookie)
    }

    return response
  } catch (err) {
    console.error("[/api/auth/admin-otp/verify] Error:", err)
    const message = err instanceof Error ? err.message : "Failed to verify code."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
