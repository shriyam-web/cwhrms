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
  clientTime: z.string().optional(),
  timezoneOffset: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Check-in-public: Processing request")
    const body = await req.json()
    const { encryptedToken, employeeCode, deviceId, latitude, longitude, clientTime } = checkInSchema.parse(body)
    console.log("[API] Check-in-public: Payload validated")

    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch (e) {
      console.error("[API] Decryption failed:", e)
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const utcTime = clientTime ? new Date(clientTime) : new Date()
    const istTime = new Date(utcTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    console.log("[API] Using time:", istTime.toISOString(), "(IST)")
    const today = new Date(istTime)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [qrTokensCollection, employeeCollection, attendanceCollection] = await Promise.all([
      db.qrTokens(),
      db.employeeProfiles(),
      db.attendanceLogs(),
    ])
    console.log("[API] Check-in-public: DB collections loaded")

    const qrToken = await qrTokensCollection.findOne({ token: decrypted })
    if (!qrToken) {
      console.error("[API] QR token not found:", decrypted)
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (utcTime > qrToken.expiresAt) {
      console.error("[API] QR expired - utcTime:", utcTime.toISOString(), "expiresAt:", qrToken.expiresAt.toISOString())
      return NextResponse.json({ error: "QR code expired" }, { status: 400 })
    }

    const employee = await employeeCollection.findOne({ employeeCode })
    if (!employee) {
      console.error("[API] Employee not found:", employeeCode)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const employeeId = employee._id.toString()

    const existingCheckIn = await attendanceCollection.findOne({
      employeeId,
      checkInTime: {
        $gte: today,
        $lt: tomorrow,
      },
      checkOutTime: null,
    })

    if (!qrToken.isUsed) {
      await qrTokensCollection.updateOne(
        { _id: qrToken._id },
        { $set: { isUsed: true, usedAt: istTime } }
      )
    }

    if (existingCheckIn) {
      await attendanceCollection.updateOne(
        { _id: existingCheckIn._id },
        { $set: { checkOutTime: istTime } }
      )
      console.log("[API] Check-out recorded for:", employeeCode)

      return NextResponse.json(
        {
          message: "Check-out successful",
          type: "checkout",
          employeeName: employee.name,
          time: istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
        { status: 200 },
      )
    }

    const insertResult = await attendanceCollection.insertOne({
      employeeId,
      userId: employee.userId,
      checkInTime: istTime,
      checkOutTime: null,
      status: "PRESENT",
      deviceId: deviceId || null,
      latitude: latitude || null,
      longitude: longitude || null,
      createdAt: istTime,
      updatedAt: istTime,
    })
    console.log("[API] Check-in recorded for:", employeeCode, "ID:", insertResult.insertedId)

    return NextResponse.json(
      {
        message: "Check-in successful",
        type: "checkin",
        employeeName: employee.name,
        time: istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[API] Validation error:", error.errors[0].message)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Public Check-in Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
