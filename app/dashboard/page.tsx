"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Zap, CheckCircle, Banknote, Clock, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const attendanceData = [
  { name: "Mon", present: 45, absent: 5, late: 3 },
  { name: "Tue", present: 48, absent: 2, late: 3 },
  { name: "Wed", present: 47, absent: 3, late: 3 },
  { name: "Thu", present: 46, absent: 4, late: 3 },
  { name: "Fri", present: 44, absent: 6, late: 3 },
]

const payrollData = [
  { name: "Processed", value: 120, fill: "#10b981" },
  { name: "Pending", value: 45, fill: "#f59e0b" },
  { name: "Rejected", value: 5, fill: "#ef4444" },
]

const employeeSparkline = [
  { value: 200 },
  { value: 210 },
  { value: 220 },
  { value: 230 },
  { value: 240 },
  { value: 248 },
]

const agentSparkline = [
  { value: 45 },
  { value: 47 },
  { value: 49 },
  { value: 50 },
  { value: 51 },
  { value: 52 },
]

const attendanceSparkline = [
  { value: 235 },
  { value: 238 },
  { value: 240 },
  { value: 241 },
  { value: 239 },
  { value: 242 },
]

const payoutSparkline = [
  { value: 1800 },
  { value: 1900 },
  { value: 2000 },
  { value: 2100 },
  { value: 2200 },
  { value: 2400 },
]

function EmployeeDashboard() {
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todayStatus, setTodayStatus] = useState<any>(null)
  const [todayStatusLoading, setTodayStatusLoading] = useState(true)
  const [checkingLocation, setCheckingLocation] = useState(false)
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await apiClient.get<any>(
          `/api/attendance/my-logs?month=${currentMonth}&year=${currentYear}`
        )
        setAttendanceLogs(response.attendanceLogs || [])
      } catch (error) {
        console.error("Failed to fetch attendance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [currentMonth, currentYear])

  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const response = await apiClient.get<any>("/api/attendance/today-checkin")
        setTodayStatus(response)
      } catch (error) {
        console.error("Failed to fetch today's check-in status:", error)
      } finally {
        setTodayStatusLoading(false)
      }
    }

    fetchTodayStatus()
  }, [])

  const getColorByStatus = (status: string, type: 'arrival' | 'departure') => {
    if (type === 'arrival') {
      switch (status) {
        case 'APPRECIATED':
          return '#a855f7'
        case 'ON TIME':
          return '#10b981'
        case 'GRACE':
          return '#f59e0b'
        case 'LATE':
          return '#ef4444'
        default:
          return '#6b7280'
      }
    } else {
      switch (status) {
        case 'APPRECIATED':
          return '#a855f7'
        case 'ON TIME':
          return '#10b981'
        case 'GRACE':
          return '#f59e0b'
        case 'EARLY':
          return '#ef4444'
        case 'NOT CHECKED OUT':
          return '#f97316'
        default:
          return '#6b7280'
      }
    }
  }

  const generateGraphData = () => {
    const uniqueDates = new Map<string, any>()
    
    attendanceLogs.forEach((log) => {
      const date = new Date(log.checkInTime)
      const dateStr = date.toISOString().split('T')[0]
      
      if (!uniqueDates.has(dateStr)) {
        uniqueDates.set(dateStr, {
          date: dateStr,
          dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: log.status,
          arrivalStatus: log.arrivalStatus,
          departureStatus: log.departureStatus,
          checkInColor: getColorByStatus(log.arrivalStatus, 'arrival'),
          checkOutColor: log.departureStatus ? getColorByStatus(log.departureStatus, 'departure') : '#d1d5db',
          checkedIn: 1,
          checkedOut: log.status === "CHECKED OUT" ? 1 : 0,
        })
      }
    })

    const sortedDates = Array.from(uniqueDates.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .reverse()

    return sortedDates.map(item => ({
      name: item.dateFormatted,
      "Check-in": item.checkedIn,
      "Check-out": item.checkedOut,
      status: item.status,
      arrivalStatus: item.arrivalStatus,
      departureStatus: item.departureStatus,
      checkInColor: item.checkInColor,
      checkOutColor: item.checkOutColor,
    }))
  }

  const graphData = generateGraphData()
  const presentCount = attendanceLogs.filter(log => log.status === "CHECKED OUT").length
  const workingDays = new Set(attendanceLogs.map(log => new Date(log.checkInTime).toDateString())).size

  const handleCheckInCheckOut = async () => {
    setCheckingLocation(true)
    try {
      let latitude = null
      let longitude = null

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude
              longitude = position.coords.longitude
              console.log("[Dashboard] Geolocation obtained:", { latitude, longitude })
              resolve()
            },
            (error) => {
              console.warn("[Dashboard] Geolocation error:", error)
              resolve()
            },
            { timeout: 5000, enableHighAccuracy: false }
          )
        })
      }

      // Get current user info with employee code from database
      const meResponse = await apiClient.get<any>("/api/auth/me")
      const currentUser = meResponse.user
      console.log("[Dashboard] Current user:", currentUser)
      
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Get employee profile with employee code
      const employeesResponse = await apiClient.get<any>("/api/employees")
      console.log("[Dashboard] Employees response:", employeesResponse)
      const employees = employeesResponse.employees || []
      const currentEmployee = employees.find((emp: any) => emp.id === currentUser.id)
      console.log("[Dashboard] Current employee:", currentEmployee)
      
      if (!currentEmployee || !currentEmployee.employeeCode) {
        throw new Error("Employee code not found")
      }

      // Generate QR token for check-in
      const qrResponse = await apiClient.post<any>("/api/attendance/generate-qr", {})
      console.log("[Dashboard] QR response:", qrResponse)
      const encryptedToken = qrResponse.encryptedToken
      
      if (!encryptedToken) {
        throw new Error("Failed to generate QR token")
      }

      // Get current check-in status to determine if checking in or out
      const statusResponse = await apiClient.get<any>("/api/attendance/today-checkin")
      console.log("[Dashboard] Status response:", statusResponse)
      const isCheckedIn = statusResponse?.isCheckedIn || false

      // Get current time in IST
      const now = new Date()
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const checkTime = istTime.toISOString()
      
      console.log("[Dashboard] Check-in data:", {
        encryptedToken,
        employeeCode: currentEmployee.employeeCode,
        checkTime,
        type: isCheckedIn ? "checkout" : "checkin",
        latitude,
        longitude,
      })

      // Submit check-in or check-out
      const payload: any = {
        encryptedToken,
        employeeCode: currentEmployee.employeeCode,
        checkTime,
        type: isCheckedIn ? "checkout" : "checkin",
        deviceId: "web-dashboard",
      }

      if (latitude !== null) payload.latitude = latitude
      if (longitude !== null) payload.longitude = longitude

      const checkInResponse = await apiClient.post<any>("/api/attendance/check-in-public", payload)
      console.log("[Dashboard] Check-in response:", checkInResponse)

      // Refresh status
      const updatedStatus = await apiClient.get<any>("/api/attendance/today-checkin")
      console.log("[Dashboard] Updated status after check:", updatedStatus)
      setTodayStatus(updatedStatus)
      
      setCheckingLocation(false)
    } catch (error) {
      console.error("Check-in/out failed:", error)
      setCheckingLocation(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPRECIATED":
        return "text-purple-600 dark:text-purple-400"
      case "ON TIME":
        return "text-green-600 dark:text-green-400"
      case "GRACE":
        return "text-amber-600 dark:text-amber-400"
      case "LATE":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  const formatTime = (date: Date | string) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            📊
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-slate-200 dark:to-slate-50 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Track your attendance and payroll in real-time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Today's Status</h3>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {todayStatusLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading status...</div>
                </div>
              ) : todayStatus?.checkOutTime ? (
                <>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Attendance marked for today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">✓ Complete</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                      Check-in: <span className="font-bold">{formatTime(todayStatus?.checkInTime)}</span>
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                      Check-out: <span className="font-bold">{formatTime(todayStatus?.checkOutTime)}</span>
                    </p>
                  </div>
                </>
              ) : todayStatus?.isCheckedIn ? (
                <>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">You have already checked in</p>
                    <p className={`text-2xl sm:text-3xl font-bold mt-1 ${getStatusColor(todayStatus?.arrivalStatus)}`}>
                      ✓ Checked In
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                      Check-in Time: <span className="font-bold">{formatTime(todayStatus?.checkInTime)}</span>
                    </p>
                    {todayStatus?.arrivalStatus && (
                      <p className={`text-xs sm:text-sm font-medium ${getStatusColor(todayStatus?.arrivalStatus)}`}>
                        Status: <span className="font-bold">{todayStatus?.arrivalStatus}</span>
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleCheckInCheckOut}
                    disabled={checkingLocation}
                    className="w-full text-sm sm:text-base h-10 sm:h-11 bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    {checkingLocation ? "Processing..." : "Check Out"}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Check-in Status</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">Not Checked In</p>
                  </div>
                  <Button 
                    onClick={handleCheckInCheckOut}
                    className="w-full text-sm sm:text-base h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={checkingLocation}
                  >
                    {checkingLocation ? "Processing..." : "Check In Now"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Monthly Attendance</h3>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">{presentCount}</span>
                <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">days</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Present this month</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[75%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-950/5 group hover:scale-105 transform sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Payroll Status</h3>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Payroll functionality is coming soon</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">This feature is not yet integrated with your dashboard</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Your Attendance Record</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track your attendance pattern over the last 7 days</p>
            </div>
            <Link href="/dashboard/my-attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                <span className="text-xs font-medium text-muted-foreground">Early/Appreciated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-xs font-medium text-muted-foreground">On Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                <span className="text-xs font-medium text-muted-foreground">Grace Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span className="text-xs font-medium text-muted-foreground">Late/Early Out</span>
              </div>
            </div>
            <div className="w-full h-72 sm:h-96 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading attendance data...</p>
                </div>
              ) : graphData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No attendance records available for this month</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 13, fontWeight: 500 }} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 13 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value, name) => {
                        if (value === 0) return ["-", name]
                        return ["✓", name]
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="Check-in" radius={[12, 12, 0, 0]}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-in-${index}`} fill={entry.checkInColor} opacity={0.9} />
                      ))}
                    </Bar>
                    <Bar dataKey="Check-out" radius={[12, 12, 0, 0]}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-out-${index}`} fill={entry.checkOutColor} opacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-50/50 dark:from-indigo-950/20 dark:to-indigo-950/5 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-200/30 rounded-full -mr-20 -mb-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Quick Actions</h3>
              <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/attendance" className="block">
                <Button className="w-full justify-between text-sm sm:text-base h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all group/btn">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    View Attendance
                  </span>
                  <span className="text-xs">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-cyan-50/50 dark:from-cyan-950/20 dark:to-cyan-950/5 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-200/30 rounded-full -mr-20 -mb-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Need Help?</h3>
              <div className="p-3 bg-cyan-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Have questions or need support? Reach out to our HR team anytime.</p>
            <Button className="w-full text-sm sm:text-base h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all">
              Contact HR Team
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            👨‍💼
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-slate-200 dark:to-slate-50 bg-clip-text text-transparent">
              HRMS Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your workforce and view comprehensive analytics at a glance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Employees"
          value="248"
          change={12}
          changeLabel="+12 this month"
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />}
          sparklineData={employeeSparkline}
          gradient="from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatCard
          title="Total Agents"
          value="52"
          change={6}
          changeLabel="+3 this month"
          icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />}
          sparklineData={agentSparkline}
          gradient="from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900"
        />
        <StatCard
          title="Today Present"
          value="242"
          change={98}
          changeLabel="98% attendance"
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />}
          sparklineData={attendanceSparkline}
          gradient="from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatCard
          title="Payouts (₹)"
          value="2.4M"
          change={15}
          changeLabel="120 processed"
          icon={<Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />}
          sparklineData={payoutSparkline}
          gradient="from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-8 lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Weekly Attendance</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Comprehensive employee attendance overview</p>
              </div>
              <Link href="/dashboard/attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                View More →
              </Link>
            </div>
            <div className="w-full h-80 sm:h-96 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 13, fontWeight: 500 }} />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "13px", fontWeight: 500 }} />
                  <Bar dataKey="present" fill="url(#colorPresent)" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="absent" fill="url(#colorAbsent)" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="late" fill="url(#colorLate)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Payroll Status</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Distribution overview</p>
              </div>
              <Link href="/dashboard/payouts" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                View →
              </Link>
            </div>
            <div className="w-full h-72 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payrollData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {payrollData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Attendance Rate</h3>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">98%</span>
                <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">↑ 2%</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">vs last week</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[98%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Active Agents</h3>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">48</span>
                <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">↑ 3</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">of 52 total</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full w-[92%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-yellow-50/50 dark:from-yellow-950/20 dark:to-yellow-950/5 group hover:scale-105 transform sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Pending Payouts</h3>
              <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                <Banknote className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-yellow-600 dark:text-yellow-400">45</span>
                <span className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-bold bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">↓ 5</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">to process</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full w-[27%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      ) : user?.role === "EMPLOYEE" ? (
        <EmployeeDashboard />
      ) : (
        <AdminDashboard />
      )}
    </DashboardLayout>
  )
}
