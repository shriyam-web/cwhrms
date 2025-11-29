import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let whereClause: any = {
      userId: payload.id,
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      endDate.setHours(23, 59, 59, 999)

      whereClause.checkInTime = {
        gte: startDate,
        lte: endDate,
      }
    }

    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: {
        checkInTime: "desc",
      },
    })

    const formattedLogs = attendanceLogs.map((log) => ({
      id: log.id,
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
      status: log.status,
      latitude: log.latitude,
      longitude: log.longitude,
      deviceId: log.deviceId,
      checkInFormatted: new Date(log.checkInTime).toLocaleString(),
      checkOutFormatted: log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : null,
    }))

    return NextResponse.json({ attendanceLogs: formattedLogs }, { status: 200 })
  } catch (error) {
    console.error("[Get Attendance Logs Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
