import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

// ১. GET: সব চাকরির তথ্য ডেটাবেজ থেকে নিয়ে আসা
export async function GET() {
  try {
    const db = await getDb()
    // jobs কালেকশন থেকে সব জব ফেচ করা এবং লেটেস্টগুলো উপরে রাখা (createdAt: -1)
    const jobs = await db
      .collection("jobs")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, jobs }, { status: 200 })
  } catch (error) {
    console.error("GET /api/jobs error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

// ২. POST: রিক্রুটার যখন নতুন জব পোস্ট ফর্ম সাবমিট করবে
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title,
      company,
      category,
      jobType,
      isRemote,
      location,
      deadline,
      minSalary,
      maxSalary,
      frequency,
      responsibilities,
      requirements,
      postedBy,
    } = body

    // বেসিক ভ্যালিডেশন
    if (!title || !company) {
      return NextResponse.json(
        { success: false, message: "Job title and company name are required" },
        { status: 400 }
      )
    }

    const db = await getDb()

    // নতুন জব ডকুমেন্ট তৈরি করা
    const newJob = {
      title,
      company,
      category: category || "Engineering & Tech",
      jobType: jobType || "Full-time",
      isRemote: Boolean(isRemote),
      location: location || "Remote",
      deadline: deadline || "Not specified",
      minSalary: minSalary || "",
      maxSalary: maxSalary || "",
      frequency: frequency || "per hour",
      responsibilities: responsibilities || "",
      requirements: requirements || "",
      status: "Active", // ডিফল্ট স্ট্যাটাস Active
      applicantsCount: 0,
      postedBy: postedBy || "recruiter",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // MongoDB কালেকশন 'jobs'-এ ইনসার্ট করা
    const result = await db.collection("jobs").insertOne(newJob)

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        jobId: result.insertedId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/jobs error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to post job" },
      { status: 500 }
    )
  }
}
