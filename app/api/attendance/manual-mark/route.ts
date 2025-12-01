import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { z } from "zod"

const manualMarkSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  checkInTime: z.string().min(1, "Check-in time is required"),
  checkOutTime: z.string().optional().nullable(),
  notes: z.string().optional(),
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
      return NextResponse.json({ error: "Only HR can manually mark attendance" }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, checkInTime, checkOutTime, notes } = manualMarkSchema.parse(body)

    const attendanceCollection = await db.attendanceLogs()
    const employeeCollection = await db.employeeProfiles()

    const employee = await employeeCollection.findOne({
      _id: ObjectId.isValid(employeeId) ? new ObjectId(employeeId) : { $ne: null }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const checkInDate = new Date(checkInTime)
    const checkOutDate = checkOutTime ? new Date(checkOutTime) : null

    const status = checkOutDate ? "CHECKED OUT" : "CHECKED IN"

    const attendanceData = {
      employeeId: employee._id,
      userId: employee.userId,
      employeeCode: employee.employeeCode,
      checkInTime: checkInDate,
      checkOutTime: checkOutDate,
      status,
      notes: notes || null,
      markedByHR: true,
      markedByHRAt: new Date(),
      markedByHRId: new ObjectId(payload.id),
      latitude: null,
      longitude: null,
      deviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await attendanceCollection.insertOne(attendanceData)

    return NextResponse.json(
      {
        message: "Attendance marked successfully",
        attendanceId: result.insertedId.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Manual Mark Attendance Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
