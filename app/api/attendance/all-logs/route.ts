import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"

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

    let whereClause: any = {}

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      endDate.setHours(23, 59, 59, 999)

      whereClause.checkInTime = {
        gte: startDate,
        lte: endDate,
      }
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      whereClause.checkInTime = {
        gte: today,
      }
    }

    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: {
        checkInTime: "desc",
      },
    })

    const employeeCollection = await db.employeeProfiles()

    const formattedLogs = await Promise.all(
      attendanceLogs.map(async (log) => {
        const employee = await employeeCollection.findOne({ _id: log.employeeId })
        return {
          id: log.id,
          employeeId: log.employeeId,
          employeeName: employee?.name || "Unknown",
          checkInTime: log.checkInTime,
          checkOutTime: log.checkOutTime,
          status: log.status,
          latitude: log.latitude,
          longitude: log.longitude,
          checkInFormatted: new Date(log.checkInTime).toLocaleString(),
          checkOutFormatted: log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : null,
        }
      })
    )

    return NextResponse.json({ attendanceLogs: formattedLogs }, { status: 200 })
  } catch (error) {
    console.error("[Get All Attendance Logs Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
