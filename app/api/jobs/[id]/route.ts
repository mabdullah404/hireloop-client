import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

// ১. PATCH: নির্দিষ্ট একটি চাকরির তথ্য এডিট/আপডেট করা
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Job ID" },
        { status: 400 }
      )
    }

    const updates = await req.json()
    // updatedAt আপডেট করা
    updates.updatedAt = new Date()

    const db = await getDb()
    const result = await db.collection("jobs").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Job updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update job" },
      { status: 500 }
    )
  }
}

// ২. DELETE: নির্দিষ্ট একটি চাকরি ডেটাবেজ থেকে মুছে ফেলা
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Job ID" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db
      .collection("jobs")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Job deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete job" },
      { status: 500 }
    )
  }
}
