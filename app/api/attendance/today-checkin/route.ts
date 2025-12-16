import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getISTNow } from "@/lib/utils"

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

    const employeeCollection = await db.employeeProfiles()
    const employee = await employeeCollection.findOne({
      _id: ObjectId.isValid(payload.id) ? new ObjectId(payload.id) : { $eq: payload.id }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 })
    }

    const istNow = getISTNow()
    
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
    const istDateObj = new Date(istNow.getTime() + IST_OFFSET_MS)
    const year = istDateObj.getUTCFullYear()
    const month = String(istDateObj.getUTCMonth() + 1).padStart(2, '0')
    const day = String(istDateObj.getUTCDate()).padStart(2, '0')
    const istDateString = `${year}-${month}-${day}`
    
    const istMidnightLocal = new Date(`${istDateString}T00:00:00`)
    const todayIST = new Date(istMidnightLocal.getTime() - IST_OFFSET_MS)
    const tomorrowIST = new Date(todayIST)
    tomorrowIST.setDate(tomorrowIST.getDate() + 1)

    const attendanceCollection = await db.attendanceLogs()
    const todayLog = await attendanceCollection.findOne({
      employeeCode: employee.employeeCode,
      checkInTime: {
        $gte: todayIST,
        $lt: tomorrowIST,
      },
    })

    if (!todayLog) {
      return NextResponse.json({ 
        isCheckedIn: false,
        checkInTime: null,
        checkOutTime: null,
        arrivalStatus: null,
      }, { status: 200 })
    }

    if (todayLog.checkOutTime) {
      return NextResponse.json({ 
        isCheckedIn: false,
        checkInTime: todayLog.checkInTime,
        checkOutTime: todayLog.checkOutTime,
        arrivalStatus: null,
        latitude: todayLog.latitude,
        longitude: todayLog.longitude,
        checkOutLatitude: todayLog.checkOutLatitude,
        checkOutLongitude: todayLog.checkOutLongitude,
      }, { status: 200 })
    }

    const istCheckInTime = new Date(todayLog.checkInTime.getTime() + IST_OFFSET_MS)
    const checkInHour = istCheckInTime.getUTCHours()
    const checkInMinutes = istCheckInTime.getUTCMinutes()
    const checkInTimeMinutes = checkInHour * 60 + checkInMinutes
    const officeStartMinutes = 10 * 60
    const gracePeriod = 15

    let arrivalStatus = "LATE"
    if (checkInTimeMinutes < officeStartMinutes) {
      arrivalStatus = "APPRECIATED"
    } else if (checkInTimeMinutes <= officeStartMinutes) {
      arrivalStatus = "ON TIME"
    } else if (checkInTimeMinutes <= officeStartMinutes + gracePeriod) {
      arrivalStatus = "GRACE"
    } else {
      arrivalStatus = "LATE"
    }

    return NextResponse.json({
      isCheckedIn: true,
      checkInTime: todayLog.checkInTime,
      checkOutTime: todayLog.checkOutTime,
      arrivalStatus: arrivalStatus,
      latitude: todayLog.latitude,
      longitude: todayLog.longitude,
    }, { status: 200 })
  } catch (error) {
    console.error("[Today Checkin Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
