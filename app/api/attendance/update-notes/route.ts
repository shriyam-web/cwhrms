import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { z } from "zod"

const updateNotesSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  notes: z.string().min(0).max(500, "Notes must be 500 characters or less"),
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
    const { attendanceId, notes } = updateNotesSchema.parse(body)

    const attendanceCollection = await db.attendanceLogs()

    const objectId = ObjectId.isValid(attendanceId) ? new ObjectId(attendanceId) : attendanceId

    const result = await attendanceCollection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          notes: notes || null,
          updatedAt: new Date(),
          updatedBy: payload.id,
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: "Notes updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Update Notes Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
