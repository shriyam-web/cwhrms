import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"

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

    const [attendanceCollection, employeeCollection] = await Promise.all([
      db.attendanceLogs(),
      db.employeeProfiles(),
    ])

    const employee = await employeeCollection.findOne({
      _id: ObjectId.isValid(payload.id) ? new ObjectId(payload.id) : { $eq: payload.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 })
    }

    const query: any = { employeeCode: employee.employeeCode }
    if (Object.keys(dateFilter).length > 0) {
      query.checkInTime = dateFilter
    }

    const attendanceLogs = await attendanceCollection
      .find(query)
      .sort({ checkInTime: -1 })
      .toArray()

    const formattedLogs = attendanceLogs.map((log) => {
      const status = log.checkOutTime ? "CHECKED OUT" : "CHECKED IN"
      
      const istCheckInTime = new Date(log.checkInTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const checkInHour = istCheckInTime.getHours()
      const checkInMinutes = istCheckInTime.getMinutes()
      const checkInTimeMinutes = checkInHour * 60 + checkInMinutes
      const officeStartMinutes = 10 * 60
      const gracePeriod = 15
      
      let arrivalStatus = "LATE"
      if (checkInTimeMinutes < officeStartMinutes) {
        arrivalStatus = "APPRECIATED"
      } else if (checkInTimeMinutes === officeStartMinutes) {
        arrivalStatus = "PERFECT"
      } else if (checkInTimeMinutes <= officeStartMinutes + gracePeriod) {
        arrivalStatus = "GRACE"
      } else {
        arrivalStatus = "LATE"
      }

      let departureStatus = "NOT CHECKED OUT"
      if (log.checkOutTime) {
        const istCheckOutTime = new Date(log.checkOutTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
        const checkOutHour = istCheckOutTime.getHours()
        const checkOutMinutes = istCheckOutTime.getMinutes()
        const checkOutTimeMinutes = checkOutHour * 60 + checkOutMinutes
        
        const CHECKOUT_EARLY_TIME = 18 * 60 + 15
        const CHECKOUT_GRACE_TIME = 18 * 60 + 25
        const CHECKOUT_ONTIME_TIME = 19 * 60
        
        if (checkOutTimeMinutes < CHECKOUT_EARLY_TIME) {
          departureStatus = "EARLY"
        } else if (checkOutTimeMinutes < CHECKOUT_GRACE_TIME) {
          departureStatus = "GRACE"
        } else if (checkOutTimeMinutes < CHECKOUT_ONTIME_TIME) {
          departureStatus = "ON TIME"
        } else {
          departureStatus = "APPRECIATED"
        }
      }
      
      return {
        id: log._id.toString(),
        checkInTime: log.checkInTime,
        checkOutTime: log.checkOutTime,
        status: status,
        arrivalStatus: arrivalStatus,
        departureStatus: departureStatus,
        isHalfDay: log.status === "HALF_DAY",
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
