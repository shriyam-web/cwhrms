import { type NextRequest, NextResponse } from "next/server"
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

    let dateFilter: any = {}

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      endDate.setHours(23, 59, 59, 999)

      dateFilter = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    const attendanceCollection = await db.attendanceLogs()

    const query: any = { userId: payload.id }
    if (Object.keys(dateFilter).length > 0) {
      query.checkInTime = dateFilter
    }

    const attendanceLogs = await attendanceCollection
      .find(query)
      .sort({ checkInTime: -1 })
      .toArray()

    const formattedLogs = attendanceLogs.map((log) => {
      const status = log.checkOutTime ? "CHECKED OUT" : "CHECKED IN"
      
      return {
        id: log._id.toString(),
        checkInTime: log.checkInTime,
        checkOutTime: log.checkOutTime,
        status: status,
        latitude: log.latitude,
        longitude: log.longitude,
        deviceId: log.deviceId,
        checkInFormatted: log.checkInTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        checkOutFormatted: log.checkOutTime 
          ? log.checkOutTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          : "Not checked out",
      }
    })

    return NextResponse.json({ attendanceLogs: formattedLogs }, { status: 200 })
  } catch (error) {
    console.error("[Get Attendance Logs Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
