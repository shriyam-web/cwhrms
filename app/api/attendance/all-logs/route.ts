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
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = {
        $gte: today,
      }
    }

    const [attendanceCollection, employeeCollection] = await Promise.all([
      db.attendanceLogs(),
      db.employeeProfiles(),
    ])

    const attendanceLogs = await attendanceCollection
      .find({ checkInTime: dateFilter })
      .sort({ checkInTime: -1 })
      .toArray()

    const formattedLogs = await Promise.all(
      attendanceLogs.map(async (log) => {
        const employee = await employeeCollection.findOne({ employeeCode: log.employeeCode })
        const status = log.checkOutTime ? "CHECKED OUT" : "CHECKED IN"
        
        const checkInLocal = new Date(log.checkInTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
        const checkInHour = checkInLocal.getHours()
        const checkInMinutes = checkInLocal.getMinutes()
        const checkInTimeMinutes = checkInHour * 60 + checkInMinutes
        const officeStartMinutes = 10 * 60
        
        let arrivalStatus = "ON TIME"
        if (checkInTimeMinutes < officeStartMinutes) {
          arrivalStatus = "EARLY"
        } else if (checkInTimeMinutes > officeStartMinutes) {
          arrivalStatus = "LATE"
        }
        
        return {
          id: log._id.toString(),
          employeeCode: log.employeeCode,
          employeeName: employee?.name || "Unknown",
          checkInTime: log.checkInTime,
          checkOutTime: log.checkOutTime,
          status: status,
          arrivalStatus: arrivalStatus,
          latitude: log.latitude,
          longitude: log.longitude,
          checkInFormatted: log.checkInTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          checkOutFormatted: log.checkOutTime 
            ? log.checkOutTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : "Not checked out",
        }
      })
    )

    return NextResponse.json({ attendanceLogs: formattedLogs }, { status: 200 })
  } catch (error) {
    console.error("[Get All Attendance Logs Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
