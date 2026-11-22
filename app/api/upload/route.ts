/**
 * ==============================================================================
 * FILE: client/app/api/upload/route.ts
 * ==============================================================================
 * PURPOSE:
 *   Secure SERVER-SIDE image upload endpoint (`POST /api/upload`) powered by Cloudinary CDN.
 *
 * WHY WE UPLOAD ON THE SERVER (NOT DIRECTLY FROM THE BROWSER):
 *   1. Keeps `CLOUDINARY_API_SECRET` 100% hidden on the server (never leaked to users).
 *   2. Validates file type (only real images: JPG, PNG, WebP, GIF — blocks huge Base64
 *      strings & unsafe SVG scripts) and size (max 5MB).
 *   3. Automatically optimizes every uploaded avatar on Cloudinary (auto format,
 *      auto quality, 400x400 smart face-centered crop) and returns a permanent,
 *      reusable live HTTPS URL (`https://res.cloudinary.com/...`) to save in MongoDB!
 *
 * CALLED FROM FRONTEND:
 *   - `client/components/auth-form.tsx` (Sign Up profile photo upload)
 *   - `client/app/dashboard/seeker/settings/_components/seeker-settings-form.tsx` (Settings avatar change)
 * ==============================================================================
 */

import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Allowed MIME types (blocks SVG/HTML/executables, allows standard raster photos)
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    // Step 1: Read Cloudinary credentials from `client/.env.local`
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured yet. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to client/.env.local.",
        },
        { status: 503 }
      )
    }

    // Configure the Cloudinary SDK with your account credentials
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })

    // Step 2: Parse the uploaded file from FormData
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = String(formData.get("folder") || "hireloop/avatars")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 })
    }

    // Step 3: Validate file MIME type and size
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, or GIF images are allowed." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum allowed size is 5MB." },
        { status: 400 }
      )
    }

    // Step 4: Convert browser File into a Node.js Buffer for Cloudinary upload stream
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 5: Stream buffer directly to Cloudinary CDN (no temp files written to disk!)
    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
      width: number
      height: number
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"))
            return
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          })
        }
      )
      stream.end(buffer)
    })

    // Step 6: Return the permanent, reusable live HTTPS Cloudinary CDN link!
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (err) {
    console.error("[/api/upload] Cloudinary error:", err)
    const message = err instanceof Error ? err.message : "Image upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
