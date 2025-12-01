import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { z } from "zod"

const forcedCheckoutSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  checkoutTime: z.string().min(1, "Checkout time is required"),
})

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
    const { attendanceId, checkoutTime } = forcedCheckoutSchema.parse(body)

    const attendanceCollection = await db.attendanceLogs()

    const objectId = ObjectId.isValid(attendanceId) ? new ObjectId(attendanceId) : attendanceId

    const result = await attendanceCollection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          checkOutTime: new Date(checkoutTime),
          status: "CHECKED OUT",
          updatedAt: new Date(),
          forcedCheckoutBy: payload.id,
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: "Forced checkout completed successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Forced Checkout Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
