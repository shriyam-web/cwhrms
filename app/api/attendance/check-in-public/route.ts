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
  type: z.enum(["checkin", "checkout"]).optional().default("checkin"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Check-in-public: Processing request")
    const body = await req.json()
    const { encryptedToken, employeeCode, deviceId, latitude, longitude, clientTime, timezoneOffset, type } = checkInSchema.parse(body)
    console.log("[API] Check-in-public: Payload validated - Type:", type)

    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch (e) {
      console.error("[API] Decryption failed:", e)
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const clientLocalTime = clientTime ? new Date(clientTime) : new Date()
    const offset = timezoneOffset || -330
    const utcTime = new Date(clientLocalTime.getTime() + offset * 60 * 1000)
    console.log("[API] Client local time:", clientLocalTime.toISOString(), "Offset:", offset, "UTC time:", utcTime.toISOString())
    
    const today = new Date(clientLocalTime)
    today.setHours(0, 0, 0, 0)
    const tomorrowLocal = new Date(today)
    tomorrowLocal.setDate(tomorrowLocal.getDate() + 1)
    
    const todayUTC = new Date(today.getTime() + offset * 60 * 1000)
    const tomorrowUTC = new Date(tomorrowLocal.getTime() + offset * 60 * 1000)

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

    if (utcTime.getTime() > qrToken.expiresAt.getTime()) {
      console.error("[API] QR expired - utcTime:", utcTime.toISOString(), "expiresAt:", qrToken.expiresAt.toISOString())
      return NextResponse.json({ error: "QR code expired" }, { status: 400 })
    }

    const employee = await employeeCollection.findOne({ employeeCode })
    if (!employee) {
      console.error("[API] Employee not found:", employeeCode)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const existingCheckIn = await attendanceCollection.findOne({
      employeeCode,
      checkInTime: {
        $gte: todayUTC,
        $lt: tomorrowUTC,
      },
      checkOutTime: null,
    })

    if (type === "checkin" && existingCheckIn) {
      console.error("[API] Duplicate check-in attempt:", employeeCode)
      return NextResponse.json({ error: "Already checked in. Please check out first." }, { status: 400 })
    }

    if (type === "checkout" && !existingCheckIn) {
      console.error("[API] Check-out without check-in:", employeeCode)
      return NextResponse.json({ error: "No active check-in found. Please check in first." }, { status: 400 })
    }

    if (!qrToken.isUsed) {
      await qrTokensCollection.updateOne(
        { _id: qrToken._id },
        { $set: { isUsed: true, usedAt: utcTime, expiresAt: utcTime } }
      )
      console.log("[API] QR code immediately expired after first use")
    }

    if (type === "checkout" && existingCheckIn) {
      await attendanceCollection.updateOne(
        { _id: existingCheckIn._id },
        { $set: { checkOutTime: utcTime, updatedAt: utcTime } }
      )
      console.log("[API] Check-out recorded for:", employeeCode)

      return NextResponse.json(
        {
          message: "Check-out successful",
          type: "checkout",
          employeeName: employee.name,
          time: utcTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
        { status: 200 },
      )
    }

    const insertResult = await attendanceCollection.insertOne({
      employeeCode,
      userId: employee.userId,
      checkInTime: utcTime,
      checkOutTime: null,
      status: "PRESENT",
      deviceId: deviceId || null,
      latitude: latitude || null,
      longitude: longitude || null,
      createdAt: utcTime,
      updatedAt: utcTime,
    })
    console.log("[API] Check-in recorded for:", employeeCode, "ID:", insertResult.insertedId)

    return NextResponse.json(
      {
        message: "Check-in successful",
        type: "checkin",
        employeeName: employee.name,
        time: utcTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
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
