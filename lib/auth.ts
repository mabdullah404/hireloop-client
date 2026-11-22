/**
 * ==============================================================================
 * FILE: client/lib/auth.ts
 * ==============================================================================
 * PURPOSE:
 *   Configures Better Auth on the Next.js SERVER side.
 *   Better Auth handles:
 *     - Email + Password sign up & sign in
 *     - Google OAuth sign in (using BETTER_CLIENT_ID & BETTER_AUTH_CLIENT_SECRET)
 *     - Automatic Account Linking for Google so users who registered with Email
 *       can also sign in with Google using the same Gmail address seamlessly!
 *     - Creating user documents in MongoDB (`hireloopdb.user`)
 *     - Creating session tokens in MongoDB (`hireloopdb.session`)
 *
 * USED BY:
 *   - `client/app/api/auth/[...all]/route.ts`
 *   - `client/app/api/auth/admin-otp/*`
 *   - `client/app/api/auth/post-oauth/route.ts`
 *   - `client/lib/core/server.ts`
 * ==============================================================================
 */

import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const mongoUri = (process.env.MONGODB_URI || process.env.BETTER_AUTH_DB_URI) as string

const globalForMongo = globalThis as unknown as { __hireloopMongoClient?: MongoClient }
export const mongoClient = globalForMongo.__hireloopMongoClient ?? new MongoClient(mongoUri)
if (process.env.NODE_ENV !== "production") {
  globalForMongo.__hireloopMongoClient = mongoClient
}

export const authDb = mongoClient.db("hireloopdb")

const googleClientId = (process.env.BETTER_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "").trim()
const googleClientSecret = (
  process.env.BETTER_AUTH_CLIENT_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  ""
).trim()

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

  // Automatically link Google OAuth to an existing account with the same verified email
  // (prevents Better Auth's `error=account_not_linked` screen!)
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  user: {
    additionalFields: {
      role: {
        type: ["seeker", "recruiter", "admin"],
        input: true,
        defaultValue: "seeker",
      },
      banned: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
      premium: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
      plan: {
        type: "string",
        input: false,
        defaultValue: "starter",
      },
    },
  },

  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        },
      }
    : {}),

  database: mongodbAdapter(authDb, {
    client: mongoClient,
  }),
})
