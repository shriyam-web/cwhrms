import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { z } from "zod"

const editAttendanceSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload || payload.role !== "HR") {
      return NextResponse.json({ error: "Only HR can edit attendance" }, { status: 403 })
    }

    const body = await req.json()
    const { attendanceId, checkInTime, checkOutTime } = editAttendanceSchema.parse(body)

    const attendanceCollection = await db.attendanceLogs()
    const userCollection = await db.users()

    const objectId = ObjectId.isValid(attendanceId) ? new ObjectId(attendanceId) : attendanceId

    const existingRecord = await attendanceCollection.findOne({ _id: objectId })
    if (!existingRecord) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    const checkInDate = new Date(checkInTime)
    const checkOutDate = checkOutTime ? new Date(checkOutTime) : null
    const status = checkOutDate ? "CHECKED OUT" : "CHECKED IN"

    const user = await userCollection.findOne({ _id: new ObjectId(payload.id) })
    const hrName = user?.name || "HR"

    const result = await attendanceCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          checkInTime: checkInDate,
          checkOutTime: checkOutDate,
          status,
          updatedAt: new Date(),
          editedByHRId: new ObjectId(payload.id),
          editedByHRName: hrName,
          editedByHRAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Failed to update attendance record" }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Attendance updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Edit Attendance Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
