import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 })
    }

    const holidaysCollection = await db.holidays()
    const holidays = await holidaysCollection.findOne({
      month: parseInt(month),
      year: parseInt(year),
    })

    return NextResponse.json({
      holidays: holidays || { month: parseInt(month), year: parseInt(year), leaveeDays: [] },
    })
  } catch (error) {
    console.error("Failed to fetch holidays:", error)
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await req.json()
    const { month, year, leaveeDays } = body

    if (!month || !year || !Array.isArray(leaveeDays)) {
      return NextResponse.json(
        { error: "Month, year, and leaveeDays are required" },
        { status: 400 }
      )
    }

    const holidaysCollection = await db.holidays()

    const result = await holidaysCollection.updateOne(
      { month, year },
      {
        $set: {
          month,
          year,
          leaveeDays,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: "Holidays updated successfully",
      data: { month, year, leaveeDays },
    })
  } catch (error) {
    console.error("Failed to update holidays:", error)
    return NextResponse.json({ error: "Failed to update holidays" }, { status: 500 })
  }
}
