import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { decryptToken } from "@/lib/encryption"
import { db } from "@/lib/db"
import { getISTNow } from "@/lib/utils"
import { z } from "zod"
import { ObjectId } from "mongodb"

const checkInSchema = z.object({
  encryptedToken: z.string(),
  employeeCode: z.string().min(1, "Employee code is required"),
  deviceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isHalfDay: z.boolean().optional(),
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
    const { encryptedToken, employeeCode, deviceId, latitude, longitude, isHalfDay } = checkInSchema.parse(body)

    // Decrypt and find QR token
    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const istNow = getISTNow()

    const qrToken = await prisma.qrToken.findUnique({
      where: { token: decrypted },
    })

    if (!qrToken) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (qrToken.isUsed) {
      return NextResponse.json({ error: "QR code already used" }, { status: 400 })
    }

    if (istNow > qrToken.expiresAt) {
      return NextResponse.json({ error: "QR code expired" }, { status: 400 })
    }

    const employeeCollection = await db.employeeProfiles()
    const employee = await employeeCollection.findOne({ employeeCode })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const employeeProfile = {
      id: employee._id.toString(),
      userId: employee.userId,
      name: employee.name,
      email: employee.email,
    }

    const istDateString = istNow.toISOString().split('T')[0]
    const todayIST = new Date(istDateString + "T00:00:00.000Z")
    const tomorrowIST = new Date(todayIST)
    tomorrowIST.setDate(tomorrowIST.getDate() + 1)

    const existingCheckIn = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employeeProfile.id,
        checkInTime: {
          gte: todayIST,
          lt: tomorrowIST,
        },
        checkOutTime: null,
      },
    })

    if (existingCheckIn) {
      const checkOut = await prisma.attendanceLog.update({
        where: { id: existingCheckIn.id },
        data: { checkOutTime: istNow },
      })

      await prisma.qrToken.update({
        where: { id: qrToken.id },
        data: { isUsed: true, usedAt: istNow },
      })

      return NextResponse.json(
        {
          message: "Check-out successful",
          attendanceLog: checkOut,
        },
        { status: 200 },
      )
    }

    const CHECKIN_TIME = 10 * 60
    const GRACE_PERIOD = 15
    
    const hours = istNow.getHours()
    const mins = istNow.getMinutes()
    const minutes = hours * 60 + mins
    
    let status = "PRESENT"
    if (isHalfDay) {
      status = "HALF_DAY"
    } else if (minutes < CHECKIN_TIME) {
      status = "PRESENT"
    } else if (minutes <= CHECKIN_TIME + GRACE_PERIOD) {
      status = "PRESENT_GRACE"
    } else {
      status = "PRESENT_LATE"
    }

    const checkIn = await prisma.attendanceLog.create({
      data: {
        employeeId: employeeProfile.id,
        employeeCode: employee.employeeCode,
        userId: payload.id,
        checkInTime: istNow,
        status,
        deviceId,
        latitude,
        longitude,
      },
    })

    await prisma.qrToken.update({
      where: { id: qrToken.id },
      data: { isUsed: true, usedAt: istNow },
    })

    return NextResponse.json(
      {
        message: "Check-in successful",
        attendanceLog: checkIn,
      },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Check-in Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
