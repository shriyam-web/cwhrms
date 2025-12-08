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
  checkTime: z.string(),
  type: z.enum(["checkin", "checkout"]).optional().default("checkin"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Check-in-public: Processing request")
    const body = await req.json()
    const { encryptedToken, employeeCode, deviceId, latitude, longitude, checkTime, type } = checkInSchema.parse(body)
    console.log("[API] Check-in-public: Payload validated - Type:", type)

    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch (e) {
      console.error("[API] Decryption failed:", e)
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const istTime = new Date(checkTime)
    console.log("[API] IST time string received:", checkTime, "Stored as:", istTime.toISOString())
    
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
    const istDateObj = new Date(istTime.getTime() + IST_OFFSET_MS)
    const year = istDateObj.getUTCFullYear()
    const month = String(istDateObj.getUTCMonth() + 1).padStart(2, '0')
    const day = String(istDateObj.getUTCDate()).padStart(2, '0')
    const istDateString = `${year}-${month}-${day}`
    
    const istMidnightLocal = new Date(`${istDateString}T00:00:00`)
    const todayIST = new Date(istMidnightLocal.getTime() - IST_OFFSET_MS)
    const tomorrowIST = new Date(todayIST)
    tomorrowIST.setDate(tomorrowIST.getDate() + 1)

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

    if (istTime.getTime() > qrToken.expiresAt.getTime()) {
      console.error("[API] QR expired - istTime:", istTime.toISOString(), "expiresAt:", qrToken.expiresAt.toISOString())
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
        $gte: todayIST,
        $lt: tomorrowIST,
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
        { $set: { isUsed: true, usedAt: istTime, expiresAt: istTime } }
      )
      console.log("[API] QR code immediately expired after first use")
    }

    if (type === "checkout" && existingCheckIn) {
      await attendanceCollection.updateOne(
        { _id: existingCheckIn._id },
        { $set: { checkOutTime: istTime, updatedAt: istTime } }
      )
      console.log("[API] Check-out recorded for:", employeeCode)

      return NextResponse.json(
        {
          message: "Check-out successful",
          type: "checkout",
          employeeName: employee.name,
          time: istTime.toLocaleString('en-IN'),
        },
        { status: 200 },
      )
    }

    const CHECKIN_TIME = 10 * 60
    const GRACE_PERIOD = 15
    
    const hours = istTime.getHours()
    const mins = istTime.getMinutes()
    const minutes = hours * 60 + mins
    
    let attendanceStatus = "PRESENT"
    if (minutes < CHECKIN_TIME) {
      attendanceStatus = "PRESENT"
    } else if (minutes <= CHECKIN_TIME + GRACE_PERIOD) {
      attendanceStatus = "PRESENT_GRACE"
    } else {
      attendanceStatus = "PRESENT_LATE"
    }

    const insertResult = await attendanceCollection.insertOne({
      employeeId: employee._id.toString(),
      employeeCode,
      userId: employee.userId,
      checkInTime: istTime,
      checkOutTime: null,
      status: attendanceStatus,
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
        time: istTime.toLocaleString('en-IN'),
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
