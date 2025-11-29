import { type NextRequest, NextResponse } from "next/server"
import { decryptToken } from "@/lib/encryption"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { z } from "zod"

const checkInSchema = z.object({
  encryptedToken: z.string(),
  employeeCode: z.string().min(1, "Employee code is required"),
  deviceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { encryptedToken, employeeCode, deviceId, latitude, longitude } = checkInSchema.parse(body)

    // Decrypt token
    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [qrTokensCollection, employeeCollection, attendanceCollection] = await Promise.all([
      db.qrTokens(),
      db.employeeProfiles(),
      db.attendanceLogs(),
    ])

    // Validate QR token
    let qrToken = await qrTokensCollection.findOne({ token: decrypted })
    if (!qrToken) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (now > qrToken.expiresAt) {
      return NextResponse.json({ error: "QR code expired" }, { status: 400 })
    }

    // Get employee
    const employee = await employeeCollection.findOne({ employeeCode })
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const employeeId = employee._id.toString()

    // Check if already checked in today
    const existingCheckIn = await attendanceCollection.findOne({
      employeeId,
      checkInTime: {
        $gte: today,
        $lt: tomorrow,
      },
      checkOutTime: null,
    })

    // Mark QR as used immediately to prevent race conditions (only if not already used)
    if (!qrToken.isUsed) {
      await qrTokensCollection.updateOne(
        { _id: qrToken._id },
        { $set: { isUsed: true, usedAt: now } }
      )
    }

    if (existingCheckIn) {
      // Check out
      const updateResult = await attendanceCollection.updateOne(
        { _id: existingCheckIn._id },
        { $set: { checkOutTime: now } }
      )

      return NextResponse.json(
        {
          message: "Check-out successful",
          type: "checkout",
          employeeName: employee.name,
          time: now.toLocaleString(),
        },
        { status: 200 },
      )
    }

    // Check in
    const insertResult = await attendanceCollection.insertOne({
      employeeId,
      userId: employee.userId,
      checkInTime: now,
      checkOutTime: null,
      status: "PRESENT",
      deviceId: deviceId || null,
      latitude: latitude || null,
      longitude: longitude || null,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      {
        message: "Check-in successful",
        type: "checkin",
        employeeName: employee.name,
        time: now.toLocaleString(),
      },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Public Check-in Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
