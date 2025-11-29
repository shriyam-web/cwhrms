import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { decryptToken } from "@/lib/encryption"
import { db } from "@/lib/db"
import { z } from "zod"
import { ObjectId } from "mongodb"

const checkInSchema = z.object({
  encryptedToken: z.string(),
  employeeCode: z.string().min(1, "Employee code is required"),
  deviceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
    const { encryptedToken, employeeCode, deviceId, latitude, longitude } = checkInSchema.parse(body)

    // Decrypt and find QR token
    let decrypted: string
    try {
      decrypted = decryptToken(encryptedToken)
    } catch {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const qrToken = await prisma.qrToken.findUnique({
      where: { token: decrypted },
    })

    if (!qrToken) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (qrToken.isUsed) {
      return NextResponse.json({ error: "QR code already used" }, { status: 400 })
    }

    if (new Date() > qrToken.expiresAt) {
      return NextResponse.json({ error: "QR code expired" }, { status: 400 })
    }

    // Get employee by employee code
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

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingCheckIn = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employeeProfile.id,
        checkInTime: {
          gte: today,
        },
        checkOutTime: null,
      },
    })

    if (existingCheckIn) {
      // Check out
      const checkOut = await prisma.attendanceLog.update({
        where: { id: existingCheckIn.id },
        data: { checkOutTime: new Date() },
      })

      // Mark QR as used
      await prisma.qrToken.update({
        where: { id: qrToken.id },
        data: { isUsed: true, usedAt: new Date() },
      })

      return NextResponse.json(
        {
          message: "Check-out successful",
          attendanceLog: checkOut,
        },
        { status: 200 },
      )
    }

    // Check in
    const checkIn = await prisma.attendanceLog.create({
      data: {
        employeeId: employeeProfile.id,
        userId: employeeProfile.userId,
        checkInTime: new Date(),
        status: "PRESENT",
        deviceId,
        latitude,
        longitude,
      },
    })

    // Mark QR as used
    await prisma.qrToken.update({
      where: { id: qrToken.id },
      data: { isUsed: true, usedAt: new Date() },
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
